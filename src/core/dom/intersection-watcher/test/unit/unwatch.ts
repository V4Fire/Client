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

test.describe('core/dom/intersection-watcher: cancelling watching for the intersection of registered elements', () => {
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
				'calling the `unwatch` with a specific element passed should cancel the observing of that element',

				async ({page}) => {
					await getObserver(engine).evaluate((observer, {target, wasInvoked}) => {
						observer.watch(target, () => {
							wasInvoked.flag = true;
						});

						observer.unwatch(target);
					}, {target, wasInvoked});

					// Scrolling vertically by the full target height
					await scrollBy(page, {top: 100, delay: 200});

					await assertWasInvokedIs(wasInvoked, false);
				}
			);

			test(
				[
					'calling the `unwatch` with passing a specific element and a threshold value',
					'should remove that handler for that element'
				].join(' '),

				async ({page}) => {
					const intersectionResults = await page.evaluateHandle<string[]>(() => []);

					await getObserver(engine).evaluate((observer, {target, intersectionResults}) => {
						const handlers = ['first', 'second', 'third'].map((value) => () => {
							intersectionResults.push(value);
						});

						handlers.forEach((cb) => observer.watch(target, cb));

						// Unsubscribe the second handler callback
						observer.unwatch(target, handlers[1]);
					}, {target, intersectionResults});

					// Scrolling vertically by the full target height
					await scrollBy(page, {top: 100, delay: 200});

					test.expect(await intersectionResults.evaluate((results) => results)).not.toContain('second');

					test.expect(await intersectionResults.evaluate((results) => results.length)).toBe(2);
				}
			);

			test(
				[
					'calling the `unwatch` with a specific element and a threshold value',
					'should remove all handlers that have the given threshold value set'
				].join(' '),

				async ({page}) => {
					const intersectionResults = await page.evaluateHandle<number[]>(() => []);

					await getObserver(engine).evaluate((observer, {target, intersectionResults}) => {
						const thresholds = [0.2, 0.5, 0.75, 0.5];

						thresholds.forEach((value) => observer.watch(target, {threshold: value}, () => {
							intersectionResults.push(value);
						}));

						// Unsubscribe all handlers with threshold 0.5
						observer.unwatch(target, 0.5);
					}, {target, intersectionResults});

					// Scrolling vertically by the full target height
					await scrollBy(page, {top: 100, delay: 200});

					test.expect(await intersectionResults.evaluate((results) => results)).not.toContain(0.5);

					test.expect(await intersectionResults.evaluate((results) => results.length)).toBe(2);
				}
			);

			test(
				'calling the `unwatch` without passing any arguments should cancel watching of all registered elements',

				async ({page}) => {
					await getObserver(engine).evaluate((observer, {target, wasInvoked}) => {
						observer.watch(target, () => {
							wasInvoked.flag = true;
						});

						observer.unwatch();
					}, {target, wasInvoked});

					// Scrolling vertically by the full target height
					await scrollBy(page, {top: 100, delay: 200});

					await assertWasInvokedIs(wasInvoked, false);
				}
			);

			test(
				'calling the `destroy` should cancel the watching of all registered elements and prevent the registration of new ones',

				async ({page}) => {
					await getObserver(engine).evaluate((observer, {target, wasInvoked}) => {
						observer.watch(target, () => {
							wasInvoked.flag = true;
						});

						observer.destroy();
					}, {target, wasInvoked});

					// Trying to watch with the destroyed observer instance
					const watchWithDestroyedPromise = getObserver(engine).evaluate((observer, target) =>
						new Promise((resolve) => {
							try {
								observer.watch(target, (watcher) => watcher);

							} catch (err) {
								resolve(err.message);
							}
						}), target);

					// Scrolling vertically by the full target height
					await scrollBy(page, {top: 100, delay: 200});

					await assertWasInvokedIs(wasInvoked, false);

					await test.expect(watchWithDestroyedPromise)
						.toBeResolvedTo('It isn\'t possible to add an element to watch because the watcher instance is destroyed');
				}
			);
		});
	}
});
