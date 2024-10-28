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

import { createElement, scrollBy } from 'core/dom/intersection-watcher/test/helpers';
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

test.describe('core/dom/intersection-watcher: watching for the intersection of a specific element', () => {
	let
		IntersectionObserverModule: JSHandle<{default: typeof IntersectionObserver}>,
		HeightmapObserverModule: JSHandle<{default: typeof HeightmapObserver}>,

		intersectionObserver: JSHandle<IntersectionObserver>,
		heightmapObserver: JSHandle<HeightmapObserver>;

	let
		target: ElementHandle<HTMLDivElement>;

	function getObserver(engine: string): JSHandle<IntersectionWatcherAPI> {
		return Object.cast(engine === 'intersection' ? intersectionObserver : heightmapObserver);
	}

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		target = await createElement(page, TARGET_STYLES);

		IntersectionObserverModule = await Utils.import(page, 'core/dom/intersection-watcher/engines/intersection-observer.ts');
		intersectionObserver = await IntersectionObserverModule.evaluateHandle(({default: Observer}) => new Observer());

		HeightmapObserverModule = await Utils.import(page, 'core/dom/intersection-watcher/engines/heightmap-observer.ts');
		heightmapObserver = await HeightmapObserverModule.evaluateHandle(({default: Observer}) => new Observer());
	});

	for (const engine of ENGINES) {
		test.describe(`using the ${engine} engine`, () => {
			test(
				'calling the `watch` without passing a handler should throw an exception',

				async () => {
					const watchPromise = getObserver(engine).evaluate((observer, target) => new Promise((resolve) => {
						try {
							// @ts-expect-error Checking for the absence of a required argument
							observer.watch(target);

						} catch (error) {
							resolve(error.message);
						}
					}), target);

					await test.expect(watchPromise).toBeResolvedTo('The watcher handler is not specified');
				}
			);

			test(
				'the watcher handler should be executed when the element enters the viewport',

				async ({page}) => {
					const watchPromise = getObserver(engine).evaluate((observer, target) => new Promise((resolve) => {
						observer.watch(target, resolve);
					}), target);

					// Scrolling vertically by the full target height (default `threshold` option value is `1`)
					await scrollBy(page, {top: 100});

					await test.expect(watchPromise).toBeResolved();
				}
			);

			test(
				'the watcher should be able to observe multiple elements at the same time',

				async ({page}) => {
					const newTargetsOffsets = [100, 200];

					// Adding two elements with a horizontal offset
					const newTargets = newTargetsOffsets.map((value) => createElement(page, {
						...TARGET_STYLES,
						marginLeft: `${value}px`
					}));

					const [secondTarget, thirdTarget] = await Promise.all(newTargets);

					const intersectionResults = await page.evaluateHandle<string[]>(() => []);

					await getObserver(engine).evaluate((observer, {target, secondTarget, thirdTarget, intersectionResults}) => {
						observer.watch(target, () => {
							intersectionResults.push('first');
						});

						observer.watch(secondTarget, () => {
							intersectionResults.push('second');
						});

						observer.watch(thirdTarget, () => {
							intersectionResults.push('third');
						});
					}, {target, secondTarget, thirdTarget, intersectionResults});

					// Scrolling vertically by the full target height
					await scrollBy(page, {top: 100, delay: 200});

					await assertIntersectionResultsIs(intersectionResults, ['first']);

					// Scrolling vertically by the full target height
					await scrollBy(page, {top: 100, delay: 200});

					await assertIntersectionResultsIs(intersectionResults, ['first', 'second']);

					// Scrolling vertically by the full target height
					await scrollBy(page, {top: 100, delay: 200});

					await assertIntersectionResultsIs(intersectionResults, ['first', 'second', 'third']);
				}
			);

			test(
				[
					'the watcher should be able to observe multiple elements at the same time,',
					'alternate elements placement (the topmost element is the rightmost)'
				].join(' '),

				async ({page}) => {
					test.fail(engine === 'heightmap', 'issue #1017 - correction of the search algorithm is required');

					// Moving the first element 200px to the right
					await target.evaluate((element) => {
						Object.assign(element.style, {
							marginLeft: '200px'
						});
					});

					const newTargetsOffsets = [100, 0];

					// Adding two elements with a horizontal offset
					const newTargets = newTargetsOffsets.map((value) => createElement(page, {
						...TARGET_STYLES,
						marginLeft: `${value}px`
					}));

					const [secondTarget, thirdTarget] = await Promise.all(newTargets);

					const intersectionResults = await page.evaluateHandle<string[]>(() => []);

					await getObserver(engine).evaluate((observer, {target, secondTarget, thirdTarget, intersectionResults}) => {
						observer.watch(target, () => {
							intersectionResults.push('first');
						});

						observer.watch(secondTarget, () => {
							intersectionResults.push('second');
						});

						observer.watch(thirdTarget, () => {
							intersectionResults.push('third');
						});
					}, {target, secondTarget, thirdTarget, intersectionResults});

					// Scrolling vertically by the full target height
					await scrollBy(page, {top: 100, delay: 200});

					await assertIntersectionResultsIs(intersectionResults, ['first']);

					// Scrolling vertically by the full target height
					await scrollBy(page, {top: 100, delay: 200});

					await assertIntersectionResultsIs(intersectionResults, ['first', 'second']);

					// Scrolling vertically by the full target height
					await scrollBy(page, {top: 100, delay: 200});

					await assertIntersectionResultsIs(intersectionResults, ['first', 'second', 'third']);
				}
			);

			test(
				[
					'the watcher should be able to observe multiple elements at the same time,',
					'alternate elements placement (the lowest element is the leftmost) and a horizontal scroll'
				].join(' '),

				async ({page}) => {
					test.fail(engine === 'heightmap', 'issue #1017 - correction of the search algorithm is required');

					// Moving the first element 200px beyond the right border of the viewport
					await target.evaluate((element) => {
						Object.assign(element.style, {
							marginLeft: 'calc(100vw + 200px)'
						});
					});

					const newTargetsOffsets = [100, 0];

					// Adding two elements with a horizontal offset
					const newTargets = newTargetsOffsets.map((value) => createElement(page, {
						...TARGET_STYLES,
						marginLeft: `calc(100vw + ${value}px)`
					}));

					const [secondTarget, thirdTarget] = await Promise.all(newTargets);

					const intersectionResults = await page.evaluateHandle<string[]>(() => []);

					await getObserver(engine).evaluate((observer, {target, secondTarget, thirdTarget, intersectionResults}) => {
						observer.watch(target, () => {
							intersectionResults.push('first');
						});

						observer.watch(secondTarget, () => {
							intersectionResults.push('second');
						});

						observer.watch(thirdTarget, () => {
							intersectionResults.push('third');
						});
					}, {target, secondTarget, thirdTarget, intersectionResults});

					// Scrolling vertically to the bottom of the page and horizontally by the full target width
					await scrollBy(page, {top: 300, left: 100, delay: 200});

					await assertIntersectionResultsIs(intersectionResults, ['third']);

					// Scrolling horizontally by the full target width
					await scrollBy(page, {left: 100, delay: 200});

					await assertIntersectionResultsIs(intersectionResults, ['third', 'second']);

					// Scrolling horizontally by the full target width
					await scrollBy(page, {left: 100, delay: 200});

					await assertIntersectionResultsIs(intersectionResults, ['third', 'second', 'first']);
				}
			);
		});
	}

	async function assertIntersectionResultsIs(
		intersectionResults: JSHandle<string[]>,
		assertion: string[]
	) {
		test.expect(await intersectionResults.evaluate((results) => results)).toMatchObject(assertion);
	}
});
