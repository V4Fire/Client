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
import Bom from 'tests/helpers/bom';

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

	test('watcher method watch should throw if the handler callback is not specified', async ({page}) => {
		const watchError = await page.evaluateHandle(() => ({message: ''}));

		await resizeWatcher.evaluate((watcher, {target, watchError}) => {
			try {
				// @ts-expect-error Checking for the absence of a required argument
				watcher.watch(target);

			} catch (error) {
				watchError.message = error.message;
			}
		}, {target, watchError});

		test.expect(await watchError.evaluate(({message}) => message)).toBe('The watcher handler is not specified');
	});

	test('watcher handler should be executed initially (due to default watchInit option value)', async ({page}) => {
		await resizeWatcher.evaluate((watcher, {target, wasInvoked}) => {
			watcher.watch(target, () => {
				wasInvoked.flag = true;
			});
		}, {target, wasInvoked});

		await Bom.waitForIdleCallback(page);

		test.expect(await wasInvoked.evaluate(({flag}) => flag)).toBe(true);
	});

	test('watcher handler should not be executed initially when watchInit option value is false)', async ({page}) => {
		await resizeWatcher.evaluate((watcher, {target, wasInvoked}) => {
			watcher.watch(target, {watchInit: false}, () => {
				wasInvoked.flag = true;
			});

		}, {target, wasInvoked});

		await Bom.waitForIdleCallback(page);

		test.expect(await wasInvoked.evaluate(({flag}) => flag)).toBe(false);
	});

	test('watcher handler should be executed when the target size changes', async ({page}) => {
		await resizeWatcher.evaluate((watcher, {target, wasInvoked}) => {
			watcher.watch(target, {watchInit: false}, () => {
				wasInvoked.flag = true;
			});
		}, {target, wasInvoked});

		await Bom.waitForIdleCallback(page);

		// Increasing the target width by 10px
		await changeTargetSize(page, target, {w: 110});

		test.expect(await wasInvoked.evaluate(({flag}) => flag)).toBe(true);
	});

	test(
		'watcher handler should not be executed when the target width changes and the watchWidth option values is false',

		async ({page}) => {
			await resizeWatcher.evaluate((watcher, {target, wasInvoked}) => {
				watcher.watch(target, {watchInit: false, watchWidth: false}, () => {
					wasInvoked.flag = true;
				});
			}, {target, wasInvoked});

			await Bom.waitForIdleCallback(page);

			// Increasing the target width by 10px
			await changeTargetSize(page, target, {w: 110});

			test.expect(await wasInvoked.evaluate(({flag}) => flag)).toBe(false);
		}
	);

	test(
		'watcher handler should not be executed when the target height changes and the watchHeight option values is false',

		async ({page}) => {
			await resizeWatcher.evaluate((watcher, {target, wasInvoked}) => {
				watcher.watch(target, {watchInit: false, watchHeight: false}, () => {
					wasInvoked.flag = true;
				});
			}, {target, wasInvoked});

			await Bom.waitForIdleCallback(page);

			// Increasing the target height by 10px
			await changeTargetSize(page, target, {h: 110});

			test.expect(await wasInvoked.evaluate(({flag}) => flag)).toBe(false);
		}
	);

	test('target observation should be cancelled after first resizing when the once option is true', async ({page}) => {
		const resizingTimes = await page.evaluateHandle(() => ({count: 0}));
		const widthValues = [110, 115, 120];

		await resizeWatcher.evaluate((watcher, {target, resizingTimes}) => {
			watcher.watch(target, {watchInit: false, once: true}, () => {
				resizingTimes.count += 1;
			});

		}, {target, resizingTimes});

		await Bom.waitForIdleCallback(page);

		// Gradually changing the target width by provided widthValues
		for (const w of widthValues) {
			await changeTargetSize(page, target, {w});
		}

		test.expect(await resizingTimes.evaluate(({count}) => count)).toBe(1);
	});

	test('watcher should cancel a target watching by the unwatch method', async ({page}) => {
		await resizeWatcher.evaluate((watcher, {target, wasInvoked}) => {
			watcher.watch(target, {watchInit: false}, () => {
				wasInvoked.flag = true;
			});

			watcher.unwatch(target);
		}, {target, wasInvoked});

		await Bom.waitForIdleCallback(page);

		// Increasing the target height by 10px
		await changeTargetSize(page, target, {h: 110});

		test.expect(await wasInvoked.evaluate(({flag}) => flag)).toBe(false);
	});

	test('watcher should cancel a target watching by the unwatch method and specified handler', async ({page}) => {
		const resizingResults = await page.evaluateHandle<string[]>(() => []);

		await resizeWatcher.evaluate((watcher, {target, resizingResults}) => {
			const handlers = ['first', 'second', 'third'].map((value) => () => {
				resizingResults.push(value);
			});

			handlers.forEach((cb) => watcher.watch(target, {watchInit: false}, cb));

			// Unsubscribing the second handler callback
			watcher.unwatch(target, handlers[1]);
		}, {target, resizingResults});

		await Bom.waitForIdleCallback(page);

		// Increasing the target height by 10px
		await changeTargetSize(page, target, {h: 110});

		test.expect(await resizingResults.evaluate((results) => results)).not.toContain('second');

		test.expect(await resizingResults.evaluate((results) => results.length)).toBe(2);
	});

	test(
		'watcher should cancel watching for all the registered targets and prevent registering the new ones by the destroy method',
		async ({page}) => {
			const watchError = await page.evaluateHandle<{message: string}>(() => ({message: ''}));

			await resizeWatcher.evaluate((watcher, {target, wasInvoked}) => {
				watcher.watch(target, {watchInit: false}, () => {
					wasInvoked.flag = true;
				});

				watcher.destroy();
			}, {target, wasInvoked});

			// Trying to watch with destroyed watcher instance
			await resizeWatcher.evaluate((watcher, {target, watchError}) => {
				try {
					watcher.watch(target, (newGeometry) => newGeometry);

				} catch (error) {
					watchError.message = error.message;
				}
			}, {target, watchError});

			await Bom.waitForIdleCallback(page);

			// Increasing the target height by 10px
			await changeTargetSize(page, target, {h: 110});

			test.expect(await wasInvoked.evaluate(({flag}) => flag)).toBe(false);

			test.expect(await watchError.evaluate(({message}) => message))
				.toBe("It isn't possible to add an element to watch because the watcher instance is destroyed");
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

		await Bom.waitForIdleCallback(page);
	}
});
