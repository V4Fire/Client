/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import test from 'tests/config/unit/test';
import { Utils, BOM } from 'tests/helpers';

import type ResizeWatcher from 'core/dom/resize-watcher';

test.use({
	viewport: {
		width: 1024,
		height: 1024
	}
});

test.describe('core/dom/resize-watcher', () => {
	let
		ResizeWatcherModule: JSHandle<{default: typeof ResizeWatcher}>,
		resizeWatcher: JSHandle<ResizeWatcher>;

	let
		target: JSHandle<HTMLDivElement>,
		wasInvoked: JSHandle<{flag: boolean}>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		target = await page.evaluateHandle(() => {
			const element = document.createElement('div');
			document.body.append(element);

			Object.assign(element.style, {
				width: '100px',
				height: '100px'
			});

			return element;
		});

		wasInvoked = await page.evaluateHandle(() => ({flag: false}));

		ResizeWatcherModule = await Utils.import(page, 'core/dom/resize-watcher');
		resizeWatcher = await ResizeWatcherModule.evaluateHandle(({default: Watcher}) => new Watcher());
	});

	test.describe('watching for the resizing of a specific element', () => {
		test(
			'calling the `watch` without passing a handler should throw an exception',

			async () => {
				const watchPromise = resizeWatcher.evaluate((watcher, target) => new Promise((resolve) => {
					try {
						// @ts-expect-error Checking for the absence of a required argument
						watcher.watch(target);

					} catch (error) {
						resolve(error.message);
					}
				}), target);

				await test.expect(watchPromise).toBeResolvedTo('The watcher handler is not specified');
			}
		);

		test(
			'the watcher handler should be executed initially after the watching of the element is initialized',

			async ({page}) => {
				const watchPromise = resizeWatcher.evaluate((watcher, target) => new Promise((resolve) => {
					watcher.watch(target, resolve);
				}), target);

				await BOM.waitForIdleCallback(page);

				await test.expect(watchPromise).toBeResolved();
			}
		);

		test(
			'the watcher handler should be executed after the element is resized',

			async ({page}) => {
				const handlerExecCount = await page.evaluateHandle(() => ({count: 0}));

				await resizeWatcher.evaluate((watcher, {target, handlerExecCount}) => {
					watcher.watch(target, () => {
						handlerExecCount.count += 1;
					});
				}, {target, handlerExecCount});

				await BOM.waitForIdleCallback(page);

				// Increasing the target width by 10px
				await changeTargetSize(page, target, {w: 110});

				// By default, the handler is called initially, so the result should be 2
				test.expect(await handlerExecCount.evaluate(({count}) => count)).toBe(2);
			}
		);
	});

	test.describe('watching for the resizing with additional options provided', () => {
		test(
			'the watcher handler should not be executed initially when the `watchInit` option is set to `false`',

			async ({page}) => {
				await resizeWatcher.evaluate((watcher, {target, wasInvoked}) => {
					watcher.watch(target, {watchInit: false}, () => {
						wasInvoked.flag = true;
					});

				}, {target, wasInvoked});

				await BOM.waitForIdleCallback(page);

				await assertWasInvokedIs(false);
			}
		);

		test(
			[
				'the watcher handler should not be executed when the `watchWidth` option is set to `false`',
				'and the width of the element has changed'
			].join(' '),

			async ({page}) => {
				await resizeWatcher.evaluate((watcher, {target, wasInvoked}) => {
					watcher.watch(target, {watchInit: false, watchWidth: false}, () => {
						wasInvoked.flag = true;
					});
				}, {target, wasInvoked});

				await BOM.waitForIdleCallback(page);

				// Increasing the target width by 10px
				await changeTargetSize(page, target, {w: 110});

				await assertWasInvokedIs(false);
			}
		);

		test(
			[
				'the watcher handler should not be executed when the `watchHeight` option is set to `false`',
				'and the height of the element has changed'
			].join(' '),

			async ({page}) => {
				await resizeWatcher.evaluate((watcher, {target, wasInvoked}) => {
					watcher.watch(target, {watchInit: false, watchHeight: false}, () => {
						wasInvoked.flag = true;
					});
				}, {target, wasInvoked});

				await BOM.waitForIdleCallback(page);

				// Increasing the target height by 10px
				await changeTargetSize(page, target, {h: 110});

				await assertWasInvokedIs(false);
			}
		);

		test(
			'the watcher handler should be removed after the first resizing when the `once` option is set to `true`',

			async ({page}) => {
				const handlerExecCount = await page.evaluateHandle(() => ({count: 0}));
				const widthValues = [110, 115, 120];

				await resizeWatcher.evaluate((watcher, {target, handlerExecCount}) => {
					watcher.watch(target, {watchInit: false, once: true}, () => {
						handlerExecCount.count += 1;
					});

				}, {target, handlerExecCount});

				await BOM.waitForIdleCallback(page);

				// Gradually changing the target width by provided widthValues
				for (const w of widthValues) {
					await changeTargetSize(page, target, {w});
				}

				test.expect(await handlerExecCount.evaluate(({count}) => count)).toBe(1);
			}
		);
	});

	test.describe('cancelling watching for the resizing of registered elements', () => {
		test(
			'calling the `unwatch` with a specific element passed should cancel the watching of that element',

			async ({page}) => {
				await resizeWatcher.evaluate((watcher, {target, wasInvoked}) => {
					watcher.watch(target, {watchInit: false}, () => {
						wasInvoked.flag = true;
					});

					watcher.unwatch(target);
				}, {target, wasInvoked});

				await BOM.waitForIdleCallback(page);

				// Increasing the target height by 10px
				await changeTargetSize(page, target, {h: 110});

				await assertWasInvokedIs(false);
			}
		);

		test(
			'calling the `unwatch` with passing a specific element and a specific handler should remove that handler for that element',

			async ({page}) => {
				const resizingResults = await page.evaluateHandle<string[]>(() => []);

				await resizeWatcher.evaluate((watcher, {target, resizingResults}) => {
					const handlers = ['first', 'second', 'third'].map((value) => () => {
						resizingResults.push(value);
					});

					handlers.forEach((cb) => watcher.watch(target, {watchInit: false}, cb));

					// Unsubscribing the second handler callback
					watcher.unwatch(target, handlers[1]);
				}, {target, resizingResults});

				await BOM.waitForIdleCallback(page);

				// Increasing the target height by 10px
				await changeTargetSize(page, target, {h: 110});

				test.expect(await resizingResults.evaluate((results) => results)).not.toContain('second');

				test.expect(await resizingResults.evaluate((results) => results.length)).toBe(2);
			}
		);

		test(
			'calling the `unwatch` without passing any arguments should cancel watching of all registered elements',

			async ({page}) => {
				await resizeWatcher.evaluate((watcher, {target, wasInvoked}) => {
					watcher.watch(target, {watchInit: false}, () => {
						wasInvoked.flag = true;
					});

					watcher.unwatch();
				}, {target, wasInvoked});

				await BOM.waitForIdleCallback(page);

				// Increasing the target height by 10px
				await changeTargetSize(page, target, {h: 110});

				await assertWasInvokedIs(false);
			}
		);

		test(
			'calling the `destroy` should cancel the watching of all registered elements and prevent the registration of new ones',

			async ({page}) => {
				await resizeWatcher.evaluate((watcher, {target, wasInvoked}) => {
					watcher.watch(target, {watchInit: false}, () => {
						wasInvoked.flag = true;
					});

					watcher.destroy();
				}, {target, wasInvoked});

				// Trying to watch with the destroyed watcher instance
				const watchWithDestroyedPromise = resizeWatcher.evaluate((watcher, target) => new Promise((resolve) => {
					try {
						watcher.watch(target, (newGeometry) => newGeometry);

					} catch (error) {
						resolve(error.message);
					}
				}), target);

				await BOM.waitForIdleCallback(page);

				// Increasing the target height by 10px
				await changeTargetSize(page, target, {h: 110});

				await assertWasInvokedIs(false);

				await test.expect(watchWithDestroyedPromise)
					.toBeResolvedTo('It isn\'t possible to add an element to watch because the watcher instance is destroyed');
			}
		);
	});

	async function changeTargetSize(
		page: Page,
		target: JSHandle<HTMLDivElement>,
		{w, h}: {w?: number; h?: number}
	): Promise<void> {
		await page.evaluate(({target, w, h}) => {
			if (w != null) {
				target.style.width = `${w}px`;
			}

			if (h != null) {
				target.style.height = `${h}px`;
			}
		}, {target, w, h});

		await BOM.waitForIdleCallback(page);
	}

	async function assertWasInvokedIs(assertion: boolean): Promise<void> {
		test.expect(await wasInvoked.evaluate(({flag}) => flag)).toBe(assertion);
	}
});
