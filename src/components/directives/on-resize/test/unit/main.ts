/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ElementHandle, Locator, Page } from 'playwright';

import type {

	WatchHandler,
	WatchOptions,
	Watcher

} from 'components/directives/on-resize/interface';

import test from 'tests/config/unit/test';
import { Component } from 'tests/helpers';

test.describe('components/directives/on-resize', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('handler should be called on element init by default', async ({page}) => {
		const component = await renderDirective(page, undefined);
		await test.expect(waitForWatcherCallsCount(page, component, 1)).toBeResolved();
	});

	test('handler should be called on element width or height resize', async ({page}) => {
		const component = await renderDirective(page, undefined);
		await component.evaluate(async (div) => {
			div.style.width = '50px';
			await new Promise((resolve) => setTimeout(resolve, 300));
			div.style.height = '50px';
		});

		await test.expect(waitForWatcherCallsCount(page, component, 3)).toBeResolved();
	});

	test('handler should be called only on element height resize when `watchWidth` set to false', async ({page}) => {
		const component = await renderDirective(page, {
			watchWidth: false
		});

		await component.evaluate(async (div) => {
			div.style.width = '50px';
			await new Promise((resolve) => setTimeout(resolve, 300));
			div.style.height = '50px';
		});

		await test.expect(waitForWatcherCallsCount(page, component, 2)).toBeResolved();
	});

	test('handler should be called only on element width resize when `watchHeight` set to false', async ({page}) => {
		const component = await renderDirective(page, {
			watchHeight: false
		});

		await component.evaluate(async (div) => {
			div.style.width = '50px';
			await new Promise((resolve) => setTimeout(resolve, 300));
			div.style.height = '50px';
		});

		await test.expect(waitForWatcherCallsCount(page, component, 2)).toBeResolved();
	});

	test('handler should be called on init and only once on resize when `once` prop set to true', async ({page}) => {
		const component = await renderDirective(page, {
			once: true
		});

		await component.evaluate(async (div) => {
			div.style.width = '50px';
			await new Promise((resolve) => setTimeout(resolve, 300));
			div.style.height = '50px';
		});

		await test.expect(waitForWatcherCallsCount(page, component, 2)).toBeResolved();
	});

	test('handler should not be called on element init when `watchInit` prop set to false', async ({page}) => {
		const component = await renderDirective(page, {
			watchInit: false
		});

		await test.expect(waitForWatcherCallsCount(page, component, 0)).toBeResolved();
	});

	test('handler should not be called on padding or border change when `box`: content-box and element has box-sizing: content-box', async ({page}) => {
		const component = await renderDirective(page, undefined);

		await component.evaluate(async (div) => {
			div.style.padding = '20px';
			await new Promise((resolve) => setTimeout(resolve, 300));
			div.style.border = '2px solid black';
		});

		await test.expect(waitForWatcherCallsCount(page, component, 1)).toBeResolved();
	});

	test('handler should be called on padding or border change when `box`: border-box and element has box-sizing: content-box', async ({page}) => {
		const component = await renderDirective(page, {
			box: 'border-box'
		});

		await component.evaluate(async (div) => {
			div.style.padding = '20px';
			await new Promise((resolve) => setTimeout(resolve, 300));
			div.style.border = '2px solid black';
		});

		await test.expect(waitForWatcherCallsCount(page, component, 3)).toBeResolved();
	});

	test('handler should be called on padding or border change when `box`: content-box and element has box-sizing: border-box', async ({page}) => {
		const component = await renderDirective(page, undefined, 'border-box');

		await component.evaluate(async (div) => {
			div.style.padding = '20px';
			await new Promise((resolve) => setTimeout(resolve, 300));
			div.style.border = '2px solid black';
		});

		await test.expect(waitForWatcherCallsCount(page, component, 3)).toBeResolved();
	});

	test('handler should not be called on padding or border change when `box`: border-box and element has box-sizing: border-box', async ({page}) => {
		const component = await renderDirective(page, {
			box: 'border-box'
		}, 'border-box');

		await component.evaluate(async (div) => {
			div.style.padding = '20px';
			await new Promise((resolve) => setTimeout(resolve, 300));
			div.style.border = '2px solid black';
		});

		await test.expect(waitForWatcherCallsCount(page, component, 1)).toBeResolved();
	});

	test('all provided handlers should be called on element resize', async ({page}) => {
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
	});

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
	 * A handler to pass to the `in-view` directive
	 *
	 * @param newRect - new DOMRect value
	 * @param oldRect - previous DOMRect value
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
		directiveProps: CanUndef<CanArray<WatchHandler | Partial<WatchOptions>>>,
		elementBoxSizing: WatchOptions['box'] = 'content-box'
	): Promise<Locator> {
		const COMPONENT_TEST_ID = 'target';
		await Component.createComponent(page, 'div', {
			'v-on-resize': Object.isArray(directiveProps) ?
				directiveProps.map(addHandler) :
				addHandler(directiveProps),

			'data-testid': COMPONENT_TEST_ID,
			'data-test-resize': '0',
			style: `
				width: 100px; 
				height: 100px; 
				padding: 10px;
				border: 1px solid black;
				box-sizing: ${elementBoxSizing};`
		});

		return page.getByTestId(COMPONENT_TEST_ID);
	}

	function addHandler(
		watch: CanUndef<WatchHandler | Partial<WatchOptions>>
	) {
		if (Object.isUndef(watch) || Object.isFunction(watch)) {
			return handler;
		}

		return {...watch, handler};
	}
});
