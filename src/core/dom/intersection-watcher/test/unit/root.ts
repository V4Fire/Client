/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, ElementHandle } from 'playwright';

import test from 'tests/config/unit/test';
import { Utils } from 'tests/helpers';

import { createElement, scrollBy } from 'core/dom/intersection-watcher/test/helpers';
import { ENGINES, ROOT_STYLES, ROOT_INNER_STYLES, TARGET_STYLES } from 'core/dom/intersection-watcher/test/const';

import type IntersectionWatcherAPI from 'core/dom/intersection-watcher/engines/abstract';
import type IntersectionObserver from 'core/dom/intersection-watcher/engines/intersection-observer';
import type HeightmapObserver from 'core/dom/intersection-watcher/engines/heightmap-observer';

test.use({
	viewport: {
		width: 1024,
		height: 1024
	}
});

test.describe('core/dom/intersection-watcher: watching for the intersection with a specified root element', () => {
	let
		IntersectionObserverModule: JSHandle<{default: typeof IntersectionObserver}>,
		HeightmapObserverModule: JSHandle<{default: typeof HeightmapObserver}>,

		intersectionObserver: JSHandle<IntersectionObserver>,
		heightmapObserver: JSHandle<HeightmapObserver>;

	let
		root: ElementHandle<HTMLDivElement>,
		rootInner: ElementHandle<HTMLDivElement>,
		target: ElementHandle<HTMLDivElement>;

	function getObserver(engine: string): JSHandle<IntersectionWatcherAPI> {
		return Object.cast(engine === 'intersection' ? intersectionObserver : heightmapObserver);
	}

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		root = await createElement(page, ROOT_STYLES);
		rootInner = await createElement(page, ROOT_INNER_STYLES, root);
		target = await createElement(page, TARGET_STYLES, rootInner);

		IntersectionObserverModule = await Utils.import(page, 'core/dom/intersection-watcher/engines/intersection-observer.ts');
		intersectionObserver = await IntersectionObserverModule.evaluateHandle(({default: Observer}) => new Observer());

		HeightmapObserverModule = await Utils.import(page, 'core/dom/intersection-watcher/engines/heightmap-observer.ts');
		heightmapObserver = await HeightmapObserverModule.evaluateHandle(({default: Observer}) => new Observer());
	});

	for (const engine of ENGINES) {
		test.describe(`using the ${engine} engine`, () => {
			test(
				'the watcher handler should be executed when the element intersects the root element view',

				async ({page}) => {
					// Moving the target outside of the root view
					await page.evaluate((target) => {
						Object.assign(target.style, {
							position: 'absolute',
							top: '300px',
							left: '300px'
						});
					}, target);

					const watchPromise = getObserver(engine).evaluate((observer, {root, target}) =>
						new Promise((resolve) => {
							observer.watch(target, {root}, resolve);
						}), {root, target});

					// Scrolling until the root element is entirely in the viewport
					await scrollBy(page, {top: 300, delay: 200});

					// Scrolling the root element so that the target is in the root view
					await scrollBy(page, {top: 100, left: 100}, root);

					await test.expect(watchPromise).toBeResolved();
				}
			);

			test(
				'by default the watcher should handle scroll events related only to the root element',

				async ({page}) => {
					const intersectionCount = await page.evaluateHandle(() => ({count: 0}));

					// Moving the target to the bottom of the root inner element
					await page.evaluate((target) => {
						Object.assign(target.style, {
							position: 'absolute',
							top: '300px'
						});
					}, target);

					await getObserver(engine).evaluate((observer, {root, target, intersectionCount}) => {
						observer.watch(target, {root}, () => {
							intersectionCount.count += 1;
						});
					}, {root, target, intersectionCount});

					// Scrolling until the root element is entirely in the viewport
					await scrollBy(page, {top: 300, delay: 200});

					// Scrolling vertically so that the target is in the root view
					await scrollBy(page, {top: 200, delay: 200}, root);

					// Scrolling the page by the full height of the root element
					// so that both the root and the target are out of the viewport
					await scrollBy(page, {top: -300, delay: 200});

					// Both the root and the target are in the viewport again
					await scrollBy(page, {top: 300, delay: 200});

					test.expect(await intersectionCount.evaluate(({count}) => count)).toBe(1);
				}
			);

			test(
				[
					'the watcher should handle all scroll events when the `onlyRoot` option is set to `false`',
					'(only for the Heightmap strategy)'
				].join(' '),

				async ({page}) => {
					test.skip(engine === 'intersection', 'the intersection-observer strategy does not have the onlyRoot option');

					const intersectionCount = await page.evaluateHandle(() => ({count: 0}));

					// Moving the target to the bottom of the root inner element
					await page.evaluate((target) => {
						Object.assign(target.style, {
							position: 'absolute',
							top: '300px'
						});
					}, target);

					await getObserver(engine).evaluate((observer, {root, target, intersectionCount}) => {
						observer.watch(target, {root, onlyRoot: false}, () => {
							intersectionCount.count += 1;
						});
					}, {root, target, intersectionCount});

					// Scrolling until the root element is entirely in the viewport
					await scrollBy(page, {top: 300, delay: 200});

					// Scrolling vertically so that the target is in the root view
					await scrollBy(page, {top: 200, delay: 200}, root);

					// Scrolling the page by the full height of the root element
					// so that both the root and the target are out of the viewport
					await scrollBy(page, {top: -300, delay: 200});

					// Both the root and the target are in the viewport again
					await scrollBy(page, {top: 300, delay: 200});

					test.expect(await intersectionCount.evaluate(({count}) => count)).toBe(2);
				}
			);
		});
	}
});
