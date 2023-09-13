/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ElementHandle, Locator, Page } from 'playwright';

import test from 'tests/config/unit/test';
import { Component } from 'tests/helpers';

import type {

	WatchHandler,
	WatchOptions,
	Watcher

} from 'components/directives/on-resize/interface';

test.describe('components/directives/on-resize', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test.describe('the handler should be called', () => {
		test('upon initialization of the default element', async ({page}) => {
			const component = await renderDirective(page);
			await test.expect(waitForWatcherCallsCount(page, component, 1)).toBeResolved();
		});

		test(
			'upon initialization and only once on resize when the value of `once` is set to true',

			async ({page}) => {
				const component = await renderDirective(page, {
					once: true
				});

				await component.evaluate(async (div) => {
					div.style.width = '50px';
					await new Promise((resolve) => setTimeout(resolve, 300));
					div.style.height = '50px';
				});

				await test.expect(waitForWatcherCallsCount(page, component, 2)).toBeResolved();
			}
		);

		test('when the width or height of the element is resized.', async ({page}) => {
			const component = await renderDirective(page);

			await component.evaluate(async (div) => {
				div.style.width = '50px';
				await new Promise((resolve) => setTimeout(resolve, 300));
				div.style.height = '50px';
			});

			await test.expect(waitForWatcherCallsCount(page, component, 3)).toBeResolved();
		});

		test(
			'only when the height of the element is changed when the `watchWidth` is set to false',

			async ({page}) => {
				const component = await renderDirective(page, {
					watchWidth: false
				});

				await component.evaluate(async (div) => {
					div.style.width = '50px';
					await new Promise((resolve) => setTimeout(resolve, 300));
					div.style.height = '50px';
				});

				await test.expect(waitForWatcherCallsCount(page, component, 2)).toBeResolved();
			}
		);

		test(
			'only when the width of the element is changed when the `watchHeight` is set to false',

			async ({page}) => {
				const component = await renderDirective(page, {
					watchHeight: false
				});

				await component.evaluate(async (div) => {
					div.style.width = '50px';
					await new Promise((resolve) => setTimeout(resolve, 300));
					div.style.height = '50px';
				});

				await test.expect(waitForWatcherCallsCount(page, component, 2)).toBeResolved();
			}
		);

		test(
			[
				'when there is a change in padding or border of the element, ',
				'provided that the box model is set to "border-box" and the element has a box-sizing value of "content-box"'
			].join(''),

			async ({page}) => {
				const component = await renderDirective(page, {
					box: 'border-box'
				});

				await component.evaluate(async (div) => {
					div.style.padding = '20px';
					await new Promise((resolve) => setTimeout(resolve, 300));
					div.style.border = '2px solid black';
				});

				await test.expect(waitForWatcherCallsCount(page, component, 3)).toBeResolved();
			}
		);

		test(
			[
				'when there is a change in padding or border of the element, ',
				'regardless of whether the element has a box-sizing value of "content-box" or "border-box'
			].join(''),

			async ({page}) => {
				const component = await renderDirective(page, undefined, 'border-box');

				await component.evaluate(async (div) => {
					div.style.padding = '20px';
					await new Promise((resolve) => setTimeout(resolve, 300));
					div.style.border = '2px solid black';
				});

				await test.expect(waitForWatcherCallsCount(page, component, 3)).toBeResolved();
			}
		);
	});

	test.describe('the handler should not be called', () => {
		test('upon initialization of the element when the value of `watchInit` is set to false', async ({page}) => {
			const component = await renderDirective(page, {
				watchInit: false
			});

			await test.expect(waitForWatcherCallsCount(page, component, 0)).toBeResolved();
		});

		test(
			[
				'when there is a change in padding or border of the element when the box model is set to "content-box" and ',
				'the element has a box-sizing value of "content-box"'
			].join(''),

			async ({page}) => {
				const component = await renderDirective(page);

				await component.evaluate(async (div) => {
					div.style.padding = '20px';
					await new Promise((resolve) => setTimeout(resolve, 300));
					div.style.border = '2px solid black';
				});

				await test.expect(waitForWatcherCallsCount(page, component, 1)).toBeResolved();
			}
		);

		test(
			[
				'when there is a change in padding or border of the element when the box model is set to "border-box" and ',
				'the element has a box-sizing value of "border-box"'
			].join(''),

			async ({page}) => {
				const component = await renderDirective(page, {
					box: 'border-box'
				}, 'border-box');

				await component.evaluate(async (div) => {
					div.style.padding = '20px';
					await new Promise((resolve) => setTimeout(resolve, 300));
					div.style.border = '2px solid black';
				});

				await test.expect(waitForWatcherCallsCount(page, component, 1)).toBeResolved();
			}
		);
	});

	test(
		'all provided handlers should be called when the size of the element changes',

		async ({page}) => {
			const component = await renderDirective(page, [
				{
					once: true,
					watchInit: false
				},

				{
					once: true,
					watchInit: false
				}
			]);

			await component.evaluate((div) => {
				div.style.width = '50px';
			});

			await test.expect(waitForWatcherCallsCount(page, component, 2)).toBeResolved();
		}
	);

	/**
	 * Waits for the value of the observer's call counter to become equal to the expected value
	 *
	 * @param page
	 * @param observedEl
	 * @param expected
	 */
	async function waitForWatcherCallsCount(page: Page, observedEl: Locator, expected: number): Promise<void> {
		const handle = await observedEl.elementHandle();

		await page
			.waitForFunction(
				([div, val]) => Boolean(
					div.getAttribute('data-test-resize') === val.toString(10)
				),

				<[ElementHandle<HTMLElement>, number]>[handle, expected]
			);
	}

	/**
	 * A handler to pass to the `on-resize` directive
	 *
	 * @param newRect - the new DOMRect value
	 * @param oldRect - the previous DOMRect value
	 * @param watcher - the parameter of the watch handler
	 */
	function handler(newRect: DOMRectReadOnly, oldRect: CanUndef<DOMRectReadOnly>, watcher: Watcher): void {
		const observedEl = watcher.target;

		const previousValue = parseInt(
			observedEl.getAttribute('data-test-resize') ?? '0',
			10
		);

		const nextValue = previousValue + 1;

		watcher.target.setAttribute('data-test-resize', nextValue.toString());
	}

	async function renderDirective(
		page: Page,
		directiveProps?: CanArray<WatchHandler | Partial<WatchOptions>>,
		elementBoxSizing: WatchOptions['box'] = 'content-box'
	): Promise<Locator> {
		const componentTestId = 'target';
		await Component.createComponent(page, 'div', {
			'v-on-resize': Object.isArray(directiveProps) ?
				directiveProps.map(addHandler) :
				addHandler(directiveProps),

			'data-testid': componentTestId,
			'data-test-resize': '0',

			style: `
				width: 100px;
				height: 100px;
				padding: 10px;
				border: 1px solid black;
				box-sizing: ${elementBoxSizing};`
		});

		return page.getByTestId(componentTestId);

		function addHandler(watch: CanUndef<WatchHandler | Partial<WatchOptions>>) {
			if (Object.isUndef(watch) || Object.isFunction(watch)) {
				return handler;
			}

			return {...watch, handler};
		}
	}
});
