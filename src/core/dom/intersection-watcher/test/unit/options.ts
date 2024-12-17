/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, ElementHandle } from 'playwright';

import test from 'tests/config/unit/test';
import Utils from 'tests/helpers/utils';

import { createElement, scrollBy, assertWasInvokedIs } from 'core/dom/intersection-watcher/test/helpers';
import { ENGINES, TARGET_STYLES } from 'core/dom/intersection-watcher/test/const';

import type IntersectionWatcherAPI from 'core/dom/intersection-watcher/engines/abstract';
import type IntersectionObserver from 'core/dom/intersection-watcher/engines/intersection-observer';
import type HeightmapObserver from 'core/dom/intersection-watcher/engines/heightmap-observer';

test.use({
	viewport: {
		width: 1024,
		height: 1024
	}
});

test.describe('core/dom/intersection-watcher: watching for the intersection with additional options provided', () => {
	let
		IntersectionObserverModule: JSHandle<{default: typeof IntersectionObserver}>,
		HeightmapObserverModule: JSHandle<{default: typeof HeightmapObserver}>,

		intersectionObserver: JSHandle<IntersectionObserver>,
		heightmapObserver: JSHandle<HeightmapObserver>;

	let
		target: ElementHandle<HTMLDivElement>,
		wasInvoked: JSHandle<{flag: boolean}>;

	function getObserver(engine: string): JSHandle<IntersectionWatcherAPI> {
		return Object.cast(engine === 'intersection' ? intersectionObserver : heightmapObserver);
	}

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		target = await createElement(page, TARGET_STYLES);

		wasInvoked = await page.evaluateHandle(() => ({flag: false}));

		IntersectionObserverModule = await Utils.import(page, 'core/dom/intersection-watcher/engines/intersection-observer.ts');
		intersectionObserver = await IntersectionObserverModule.evaluateHandle(({default: Observer}) => new Observer());

		HeightmapObserverModule = await Utils.import(page, 'core/dom/intersection-watcher/engines/heightmap-observer.ts');
		heightmapObserver = await HeightmapObserverModule.evaluateHandle(({default: Observer}) => new Observer());
	});

	for (const engine of ENGINES) {
		test.describe(`using the ${engine} engine`, () => {
			test(
				'the watcher handler execution should be delayed for the time specified in the `delay` option',

				async ({page}) => {
					const delay = 1_000;

					const watchPromise = getObserver(engine).evaluate((observer, {target, delay}) =>
						new Promise<number>((resolve) => {
							const startTime = performance.now();

							observer.watch(target, {delay}, () => resolve(performance.now() - startTime));
						}), {target, delay});

					// Scroll vertically by the full target height
					await scrollBy(page, {top: 100});

					test.expect(await watchPromise).toBeGreaterThanOrEqual(delay);
				}
			);

			test(
				'the watcher handler should not be executed when the element leaves the viewport before the delay elapses',

				async ({page}) => {
					await getObserver(engine).evaluate((observer, {target, wasInvoked}) => {
						observer.watch(target, {delay: 300}, () => {
							wasInvoked.flag = true;
						});
					}, {target, wasInvoked});

					// Scrolling vertically by the full target height
					await scrollBy(page, {top: 100, delay: 200});

					// Go back to the top
					await scrollBy(page, {top: -100, delay: 200});

					await assertWasInvokedIs(wasInvoked, false);
				}
			);

			test(
				'the watcher handler should be removed after the first intersection when the `once` option is set to `true`',

				async ({page}) => {
					const intersectionTimes = await page.evaluateHandle(() => ({count: 0}));

					await getObserver(engine).evaluate((observer, {target, intersectionTimes}) => {
						observer.watch(target, {once: true}, () => {
							intersectionTimes.count += 1;
						});
					}, {target, intersectionTimes});

					// Scrolling vertically by the full target height and then go back to the top several times
					let scrollTries = 3;
					while (scrollTries > 0) {
						scrollTries -= 1;
						await scrollBy(page, {top: 100, delay: 200});
						await scrollBy(page, {top: -100, delay: 200});
					}

					test.expect(await intersectionTimes.evaluate(({count}) => count)).toBe(1);
				}
			);

			test(
				[
					'the `threshold` value should specify a ratio of intersection area',
					'to total bounding box area for the observed element'
				].join(' '),

				async ({page}) => {
					// Moving the target outside the viewport
					await target.evaluate((element) => {
						element.style.marginLeft = '100%';
					});

					await getObserver(engine).evaluate((observer, {target, wasInvoked}) => {
						observer.watch(target, {threshold: 0.75}, () => {
							wasInvoked.flag = true;
						});
					}, {target, wasInvoked});

					// Scrolling by the 80% of the target height and width
					// Now the 64% of a target area is in the viewport: 0.8h by 0.8w
					await scrollBy(page, {top: 80, left: 80, delay: 200});

					await assertWasInvokedIs(wasInvoked, false);

					// Scrolling horizontally by the 20% of the target width
					// Now the 80% of a target area is in the viewport: 0.8h by 1w
					await scrollBy(page, {left: 20, delay: 200});

					await assertWasInvokedIs(wasInvoked, true);
				}
			);

			test(
				'the watcher should be able to observe a specific element with various handlers and/or watch options',

				async ({page}) => {
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

					// Scrolling vertically by 50% of the target height, wait 500ms
					await scrollBy(page, {top: 50, delay: 500});

					// Go back to the top
					await scrollBy(page, {top: -50});

					// Due to specified delay value
					test.expect(await intersectionResults.evaluate((results) => results)).not.toContain('second');

					// Due to specified threshold value
					test.expect(await intersectionResults.evaluate((results) => results)).not.toContain('fourth');

					test.expect(await intersectionResults.evaluate((results) => results.length)).toBe(2);
				}
			);

			test(
				'the `onEnter` callback should be executed before the watcher handler is executed',

				async ({page}) => {
					const watchPromise = getObserver(engine).evaluate((observer, target) =>
						new Promise<string[]>((resolve) => {
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

					// Scrolling vertically by the full target height
					await scrollBy(page, {top: 100});

					test.expect(await watchPromise).toMatchObject(['onEnter', 'handler']);
				}
			);

			test(
				'the watcher handler should not be executed when the `onEnter` callback returns a falsy value',

				async ({page}) => {
					await getObserver(engine).evaluate((observer, {target, wasInvoked}) => {
						observer.watch(target, {onEnter: () => null}, () => {
							wasInvoked.flag = true;
						});
					}, {target, wasInvoked});

					// Scrolling vertically by the full target height
					await scrollBy(page, {top: 100, delay: 200});

					await assertWasInvokedIs(wasInvoked, false);
				}
			);

			test(
				'the `onEnter` callback should be executed immediately, ignoring the `delay` option value',

				async ({page}) => {
					const delay = 3_000;

					const watchPromise = getObserver(engine).evaluate((observer, {target, delay}) =>
						new Promise<number>((resolve) => {
							const startTime = performance.now();

							const onEnter = () => resolve(performance.now() - startTime);

							observer.watch(target, {delay, onEnter}, (watcher) => watcher);
						}), {target, delay});

					// Scrolling vertically by the full target height
					await scrollBy(page, {top: 100});

					test.expect(await watchPromise).toBeLessThan(delay);
				}
			);

			test(
				'the `onLeave` callback should be executed when the target leaves the viewport',

				async ({page}) => {
					const watchPromise = getObserver(engine).evaluate((observer, target) =>
						new Promise((resolve) => {
							observer.watch(target, {onLeave: resolve}, (watcher) => watcher);
						}), target);

					// Scrolling vertically by the full target height
					await scrollBy(page, {top: 100, delay: 200});

					// Go back to the top
					await scrollBy(page, {top: -100});

					await test.expect(watchPromise).toBeResolved();
				}
			);

			test(
				'the `onLeave` callback should be executed immediately, ignoring the `delay` option value',

				async ({page}) => {
					const delay = 3_000;

					const watchPromise = getObserver(engine).evaluate((observer, {target, delay}) =>
						new Promise<number>((resolve) => {
							const startTime = performance.now();

							const onLeave = () => resolve(performance.now() - startTime);

							observer.watch(target, {delay, onLeave}, (watcher) => watcher);
						}), {target, delay});

					// Scrolling vertically by the full target height
					await scrollBy(page, {top: 100, delay: 200});

					// Go back to the top
					await scrollBy(page, {top: -100});

					test.expect(await watchPromise).toBeLessThan(delay);
				}
			);

			test(
				'the watcher should execute the handler if the registered element is already being observed and is in the viewport',

				async ({page}) => {
					const intersectionResults = await page.evaluateHandle<string[]>(() => []);

					await getObserver(engine).evaluate((observer, {target, intersectionResults}) => {
						setTimeout(() => {
							observer.watch(target, {threshold: 0.5}, () => {
								intersectionResults.push('first');
							});
						}, 500);

						observer.watch(target, {threshold: 0.5}, () => {
							intersectionResults.push('second');
						});
					}, {target, intersectionResults});

					// Scrolling vertically by the full target height
					await scrollBy(page, {top: 100, delay: 700});

					await test.expect(intersectionResults.evaluate((res) => res)).resolves.toEqual(['second', 'first']);
				}
			);
		});
	}
});
