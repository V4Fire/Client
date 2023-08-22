/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ElementHandle, Locator, Page } from 'playwright';

import type { Watcher } from 'components/directives/on-resize';

import test from 'tests/config/unit/test';

import { Component } from 'tests/helpers';

test.describe('core/component/directives/attrs', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('the directive allows setting the value of another directive', async ({page}) => {
		const component = await renderDirective(page, 'b-dummy', {
			'v-show': false
		});

		await test.expect(component).toHaveCSS('display', 'none');
	});

	test('the directive allows setting regular props or attributes', async ({page}) => {
		const component = await renderDirective(page, 'b-dummy', {
			style: 'margin-top: 10px;',
			class: 'croatoan'
		});

		await test.expect(component).toHaveClass(/croatoan/);
		await test.expect(component).toHaveCSS('margin-top', '10px');
	});

	test('the directive allows setting event listeners with support of Vue modifiers', async ({page}) => {
		const component = await renderDirective(page, 'b-dummy', {
			'@click.once': clickHandler
		});

		await component.click();

		await component.click();

		await test.expect(component).toHaveAttribute('data-counter', '1');

	});

	test('the directive allows setting custom directives', async ({page}) => {
		const component = await renderDirective(page, 'b-dummy', {
			'v-on-resize': resizeHandler
		});

		await component.evaluate((div) => {
			div.style.width = '200px';
		});

		await test.expect(waitForWatcherCallsCount(page, component, 2)).toBeResolved();
	});

	test('the directive allows specifying directives, events, and attributes simultaneously', async ({page}) => {
		const component = await renderDirective(page, 'b-dummy', {
			style: 'margin-top: 10px;',
			'@click.once': clickHandler,
			'v-on-resize': resizeHandler
		});

		await component.evaluate((div) => {
			div.style.width = '200px';
		});

		await component.click();

		await component.click();

		await test.expect(component).toHaveCSS('margin-top', '10px');

		await test.expect(waitForWatcherCallsCount(page, component, 3)).toBeResolved();
	});

	test('the directive works correctly when used on functional components', async ({page}) => {
		const component = await renderDirective(page, 'b-dummy-functional', {
			style: 'margin-top: 10px;',
			'@click.once': clickHandler,
			'v-on-resize': resizeHandler
		});

		await component.click();

		await component.click();

		await component.evaluate((div) => {
			div.style.width = '200px';
		});

		await test.expect(component).toHaveCSS('margin-top', '10px');
		await test.expect(component).toHaveAttribute('data-counter', '3');
	});

	async function renderDirective(
		page: Page,
		componentName: string,
		attrs: RenderComponentsVnodeParams['attrs']
	): Promise<Locator> {
		const componentTestId = 'target';
		await Component.createComponent(page, componentName, {
			'data-testid': componentTestId,
			'data-counter': 0,
			'v-attrs': {...attrs},
			style: 'width: 100px; height: 100px'
		});

		return page.getByTestId(componentTestId);
	}

	async function waitForWatcherCallsCount(page: Page, observedEl: Locator, expected: number): Promise<void> {
		const handle = await observedEl.elementHandle();

		await page
			.waitForFunction(
				([div, val]) => Boolean(
					div.getAttribute('data-counter') === val.toString(10)
				),

				<[ElementHandle<HTMLElement>, number]>[handle, expected]
			);
	}

	function resizeHandler(newRect: DOMRect, oldRect: DOMRect, watcher: Watcher): void {
		const {target} = watcher;

		const previousValue = parseInt(
			target.getAttribute('data-counter') ?? '0',
			10
		);

		const nextValue = previousValue + 1;
		target.setAttribute('data-counter', nextValue.toString());
	}

	function clickHandler(event: MouseEvent): void {
		const target = <Element>event.target;

		const previousValue = parseInt(
			target.getAttribute('data-counter') ?? '0',
			10
		);

		const nextValue = previousValue + 1;
		target.setAttribute('data-counter', nextValue.toString());
	}
});
