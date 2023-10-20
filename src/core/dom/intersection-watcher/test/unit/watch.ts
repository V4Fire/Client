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

		intersectionObserver: JSHandle<IntersectionWatcherAPI>,
		heightmapObserver: JSHandle<IntersectionWatcherAPI>;

	let
		target: ElementHandle<HTMLDivElement>;

	const getObserver = (engine: string) => engine === 'intersection' ? intersectionObserver : heightmapObserver;

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
		});
	}
});
