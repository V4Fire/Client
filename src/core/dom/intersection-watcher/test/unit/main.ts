/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import test from 'tests/config/unit/test';
import Utils from 'tests/helpers/utils';
import Scroll from 'tests/helpers/scroll';
import Bom from 'tests/helpers/bom';

import type IntersectionWatcherAPI from 'core/dom/intersection-watcher/engines/abstract';
import type IntersectionObserver from 'core/dom/intersection-watcher/engines/intersection-observer';
import type HeightmapObserver from 'core/dom/intersection-watcher/engines/heightmap-observer';

test.use({
	viewport: {
		width: 1024,
		height: 1024
	}
});

test.describe('core/dom/intersection-watcher', () => {
	let
		IntersectionObserverModule: JSHandle<{default: typeof IntersectionObserver}>,
		HeightmapObserverModule: JSHandle<{default: typeof HeightmapObserver}>,

		intersectionObserver: JSHandle<IntersectionWatcherAPI>,
		heightmapObserver: JSHandle<IntersectionWatcherAPI>;

	let
		target: JSHandle<HTMLDivElement>,
		wasInvoked: JSHandle<{flag: boolean}>;

	const ENGINES = ['heightmap', 'intersection'];

	const getObserver = (engine: string) => engine === 'intersection' ? intersectionObserver : heightmapObserver;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		target = await page.evaluateHandle(() => {
			const element = document.createElement('div');
			document.body.append(element);

			Object.assign(element.style, {
				width: '100px',
				height: '100px',
				background: 'red'
			});

			return element;
		});

		wasInvoked = await page.evaluateHandle(() => ({flag: false}));

		IntersectionObserverModule = await Utils.import(page, 'core/dom/intersection-watcher/engines/intersection-observer.ts');
		intersectionObserver = await IntersectionObserverModule.evaluateHandle(({default: Observer}) => new Observer());

		HeightmapObserverModule = await Utils.import(page, 'core/dom/intersection-watcher/engines/heightmap-observer.ts');
		heightmapObserver = await HeightmapObserverModule.evaluateHandle(({default: Observer}) => new Observer());
	});

	for (const engine of ENGINES) {
		test.describe(`core/dom/intersection-watcher with ${engine} engine`, () => {
			test('watcher method watch should throw if the handler callback is not specified', async ({page}) => {
				const watchError = await page.evaluateHandle(() => ({message: ''}));

				await getObserver(engine).evaluate((observer, {target, watchError}) => {
					try {
						// @ts-expect-error Checking for the absence of a required argument
						observer.watch(target);
					} catch (error) {
						watchError.message = error.message;
					}
				}, {target, watchError});

				test.expect(await watchError.evaluate(({message}) => message)).toBe('The watcher handler is not specified');
			});

			test('watcher handler should be executed when the target enters the viewport', async ({page}) => {
				const watchPromise = getObserver(engine).evaluate((observer, target) => new Promise((resolve) => {
					observer.watch(target, resolve);
				}), target);

				// Scroll vertically by the full target height (default threshold option value is 1)
				await enterAndLeaveTarget(page, {enter: {top: 100}});

				await test.expect(watchPromise).toBeResolved();
			});

			test('watcher handler execution should be delayed when the delay option is provided', async ({page}) => {
				const delay = 1_000;

				const watchPromise = getObserver(engine).evaluate((observer, {target, delay}) => (
					new Promise<number>((resolve) => {
						const startTime = performance.now();

						observer.watch(target, {delay}, () => resolve(performance.now() - startTime));
					})
				), {target, delay});

				// Scroll vertically by the full target height
				await enterAndLeaveTarget(page, {enter: {top: 100}});

				test.expect(await watchPromise).toBeGreaterThanOrEqual(delay);
			});

			test('watcher handler should not be executed when the target leaves the viewport before the delay elapses', async ({page}) => {
				await getObserver(engine).evaluate((observer, {target, wasInvoked}) => {
					observer.watch(target, {delay: 300}, () => {
						wasInvoked.flag = true;
					});
				}, {target, wasInvoked});

				// Scroll vertically by the full target height and then go back to top after 100ms
				await enterAndLeaveTarget(page, {enter: {top: 100}, leave: {top: 0}, delay: 100});

				test.expect(await wasInvoked.evaluate(({flag}) => flag)).toBe(false);
			});

			test('target observation should be cancelled after first intersection when the once option is true', async ({page}) => {
				const intersectionTimes = await page.evaluateHandle(() => ({count: 0}));

				await getObserver(engine).evaluate((observer, {target, intersectionTimes}) => {
					observer.watch(target, {once: true}, () => {
						intersectionTimes.count += 1;
					});
				}, {target, intersectionTimes});

				// Scroll vertically by the full target height and then go back to top after 200ms several times
				let scrollTries = 3;
				while (scrollTries > 0) {
					scrollTries -= 1;
					await enterAndLeaveTarget(page, {enter: {top: 100}, leave: {top: 0}, delay: 200});
				}

				test.expect(await intersectionTimes.evaluate(({count}) => count)).toBe(1);
			});

			test('single watcher should be able to handle different handler callbacks / watch options', async ({page}) => {
				const intersectionResults = await page.evaluateHandle<string[]>(() => []);

				await getObserver(engine).evaluate((observer, {target, intersectionResults}) => {
					observer.watch(target, {threshold: 0.25}, () => {
						intersectionResults.push('first');
					});

					observer.watch(target, {threshold: 0.35, delay: 700}, () => {
						intersectionResults.push('second');
					});

					observer.watch(target, {threshold: 0.5, delay: 200}, () => {
						intersectionResults.push('third');
					});

					observer.watch(target, {threshold: 0.75, delay: 350}, () => {
						intersectionResults.push('fourth');
					});
				}, {target, intersectionResults});

				// Scroll vertically by 50% of the target height and then go back to top after 500ms
				await enterAndLeaveTarget(page, {enter: {top: 50}, leave: {top: 0}, delay: 500});

				// Due to specified delay value
				test.expect(await intersectionResults.evaluate((results) => results)).not.toContain('second');

				// Due to specified threshold value
				test.expect(await intersectionResults.evaluate((results) => results)).not.toContain('fourth');

				test.expect(await intersectionResults.evaluate((results) => results.length)).toBe(2);
			});

			test('onEnter callback should be executed before the main watcher is', async ({page}) => {
				const watchPromise = getObserver(engine).evaluate((observer, target) => new Promise<string[]>((resolve) => {
					const watchResults: string[] = [];

					const onEnter = (watcher: any) => {
						watchResults.push('onEnter');
						return watcher;
					};

					const handler = () => {
						watchResults.push('handler');
						resolve(watchResults);
					};

					observer.watch(target, {onEnter}, handler);
				}), target);

				// Scroll vertically by the full target height
				await enterAndLeaveTarget(page, {enter: {top: 100}});

				test.expect(await watchPromise).toMatchObject(['onEnter', 'handler']);
			});

			test('main watcher handler should not be executed when the onEnter callback returns a falsy value', async ({page}) => {
				await getObserver(engine).evaluate((observer, {target, wasInvoked}) => {
					observer.watch(target, {onEnter: () => null}, () => {
						wasInvoked.flag = true;
					});
				}, {target, wasInvoked});

				// Scroll vertically by the full target height
				await enterAndLeaveTarget(page, {enter: {top: 100}, delay: 100});

				test.expect(await wasInvoked.evaluate(({flag}) => flag)).toBe(false);
			});

			test('onEnter callback should be executed immediately, ignoring the delay option value', async ({page}) => {
				const delay = 3_000;

				const watchPromise = getObserver(engine).evaluate((observer, {target, delay}) => (
					new Promise<number>((resolve) => {
						const startTime = performance.now();

						const onEnter = () => resolve(performance.now() - startTime);

						observer.watch(target, {delay, onEnter}, (watcher) => watcher);
					})
				), {target, delay});

				// Scroll vertically by the full target height
				await enterAndLeaveTarget(page, {enter: {top: 100}});

				test.expect(await watchPromise).toBeLessThan(delay);
			});

			test('onLeave callback should be executed when the target leaves the viewport', async ({page}) => {
				const watchPromise = getObserver(engine).evaluate((observer, target) => new Promise((resolve) => {
					observer.watch(target, {onLeave: resolve}, (watcher) => watcher);
				}), target);

				// Scroll vertically by the full target height and then go back to top after 200ms
				await enterAndLeaveTarget(page, {enter: {top: 100}, leave: {top: -100}, delay: 200});

				await test.expect(watchPromise).toBeResolved();
			});

			test('onLeave callback should be executed immediately, ignoring the delay option value', async ({page}) => {
				const delay = 3_000;

				const watchPromise = getObserver(engine).evaluate((observer, {target, delay}) => (
					new Promise<number>((resolve) => {
						const startTime = performance.now();

						const onLeave = () => resolve(performance.now() - startTime);

						observer.watch(target, {delay, onLeave}, (watcher) => watcher);
					})
				), {target, delay});

				// Scroll vertically by the full target height and then go back to top after 200ms
				await enterAndLeaveTarget(page, {enter: {top: 100}, leave: {top: -100}, delay: 200});

				test.expect(await watchPromise).toBeLessThan(delay);
			});

			test('watcher should cancel a target watching by the unwatch method', async ({page}) => {
				await getObserver(engine).evaluate((observer, {target, wasInvoked}) => {
					observer.watch(target, () => {
						wasInvoked.flag = true;
					});

					observer.unwatch(target);
				}, {target, wasInvoked});

				// Scroll vertically by the full target height
				await enterAndLeaveTarget(page, {enter: {top: 100}, delay: 100});

				test.expect(await wasInvoked.evaluate(({flag}) => flag)).toBe(false);
			});

			test('watcher should cancel a target watching by the unwatch method and specified handler', async ({page}) => {
				const intersectionResults = await page.evaluateHandle<string[]>(() => []);

				await getObserver(engine).evaluate((observer, {target, intersectionResults}) => {
					const handlers = ['first', 'second', 'third'].map((value) => () => {
						intersectionResults.push(value);
					});

					handlers.forEach((cb) => observer.watch(target, cb));

					// Unsubscribe the second handler callback
					observer.unwatch(target, handlers[1]);
				}, {target, intersectionResults});

				// Scroll vertically by the full target height
				await enterAndLeaveTarget(page, {enter: {top: 100}, delay: 100});

				test.expect(await intersectionResults.evaluate((results) => results)).not.toContain('second');

				test.expect(await intersectionResults.evaluate((results) => results.length)).toBe(2);
			});

			test('watcher should cancel a target watching by the unwatch method and specified threshold value', async ({page}) => {
				const intersectionResults = await page.evaluateHandle<number[]>(() => []);

				await getObserver(engine).evaluate((observer, {target, intersectionResults}) => {
					const thresholds = [0.2, 0.5, 0.75, 0.5];

					thresholds.forEach((value) => observer.watch(target, {threshold: value}, () => {
						intersectionResults.push(value);
					}));

					// Unsubscribe all handlers with threshold 0.5
					observer.unwatch(target, 0.5);
				}, {target, intersectionResults});

				// Scroll vertically by the full target height
				await enterAndLeaveTarget(page, {enter: {top: 100}, delay: 100});

				test.expect(await intersectionResults.evaluate((results) => results)).not.toContain(0.5);

				test.expect(await intersectionResults.evaluate((results) => results.length)).toBe(2);
			});

			test('watcher should cancel watching for all the registered targets and prevent registering the new ones by the destroy method', async ({page}) => {
				const watchError = await page.evaluateHandle<{message: string}>(() => ({message: ''}));

				await getObserver(engine).evaluate((observer, {target, wasInvoked}) => {
					observer.watch(target, () => {
						wasInvoked.flag = true;
					});

					observer.destroy();
				}, {target, wasInvoked});

				// Trying to watch with destroyed observer instance
				await getObserver(engine).evaluate((observer, {target, watchError}) => {
					try {
						observer.watch(target, (watcher) => watcher);
					} catch (error) {
						watchError.message = error.message;
					}
				}, {target, watchError});

				// Scroll vertically by the full target height
				await enterAndLeaveTarget(page, {enter: {top: 100}, delay: 100});

				test.expect(await wasInvoked.evaluate(({flag}) => flag)).toBe(false);

				test.expect(await watchError.evaluate(({message}) => message)).toBe('It isn\'t possible to add an element to watch because the watcher instance is destroyed');
			});

			test('threshold option should represent the ratio of intersection area of a target', async ({page}) => {
				// Move the target outside of the viewport
				await target.evaluate((element) => {
					element.style.marginLeft = '100%';
				});

				await getObserver(engine).evaluate((observer, {target, wasInvoked}) => {
					observer.watch(target, {threshold: 0.75}, () => {
						wasInvoked.flag = true;
					});
				}, {target, wasInvoked});

				// Scroll by the 80% of the target height and width
				// Now the 64% of a target area is in the viewport: 0.8h by 0.8w
				await enterAndLeaveTarget(page, {enter: {top: 80, left: 80}, delay: 100});

				test.expect(await wasInvoked.evaluate(({flag}) => flag)).toBe(false);

				// Scroll horizontally by the 20% of the target width
				// Now the 80% of a target area is in the viewport: 0.8h by 1w
				await enterAndLeaveTarget(page, {enter: {left: 20}, delay: 100});

				test.expect(await wasInvoked.evaluate(({flag}) => flag)).toBe(true);
			});
		});
	}

	async function enterAndLeaveTarget(
		page: Page,
		{
			enter,
			leave,
			delay = 0
		}: {
			enter?: Omit<ScrollToOptions, 'behavior'>;
			leave?: Omit<ScrollToOptions, 'behavior'>;
			delay?: number;
		}
	): Promise<void> {
		if (enter != null) {
			await Scroll.scrollBy(page, enter);

			await Bom.waitForRAF(page, {sleepAfterRAF: delay});
		}

		if (leave != null) {
			await Scroll.scrollBy(page, leave);

			await Bom.waitForRAF(page);
		}
	}
});
