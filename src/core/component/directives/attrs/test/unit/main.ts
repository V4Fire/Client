/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import {

	renderComponentWithVAttrs,
	renderElementWithVAttrs,

	resizeHandler,
	clickHandler,

	waitForWatcherCallsCount

} from 'core/component/directives/attrs/test/helpers';

import type bComponentDirectivesAttrsDummy from 'core/component/directives/attrs/test/b-component-directives-attrs-dummy/b-component-directives-attrs-dummy';

test.describe('core/component/directives/attrs', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('should allow setting regular props or attributes', async ({page}) => {
		const component = await renderElementWithVAttrs(page, {
			style: 'margin-top: 10px;',
			class: 'croatoan'
		});

		await test.expect(component).toHaveClass(/croatoan/);
		await test.expect(component).toHaveCSS('margin-top', '10px');
	});

	test('should allow setting event listeners with support of Vue modifiers', async ({page}) => {
		const component = await renderElementWithVAttrs(page, {
			'@click.once': clickHandler
		});

		await component.click();
		await component.click();

		await test.expect(component).toHaveAttribute('data-counter', '1');
	});

	test('should allow setting Vue directives', async ({page}) => {
		const component = await renderElementWithVAttrs(page, {
			'v-show': false
		});

		await test.expect(component).toHaveCSS('display', 'none');
	});

	test('should allow setting custom directives', async ({page}) => {
		const component = await renderElementWithVAttrs(page, {
			'v-on-resize': resizeHandler
		});

		await component.evaluate((div) => {
			div.style.width = '200px';
		});

		await test.expect(waitForWatcherCallsCount(page, component, 2)).toBeResolved();
	});

	test.describe('should allow specifying directives, events, and attributes simultaneously', () => {
		test('for non-functional components', async ({page}) => {
			const component = await renderElementWithVAttrs(page, {
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

		test('for functional components', async ({page}) => {
			const component = await renderElementWithVAttrs(page, {
				style: 'margin-top: 10px;',
				'@click.once': clickHandler,
				'v-on-resize': resizeHandler
			}, true);

			await component.click();

			await component.click();

			await component.evaluate((div) => {
				div.style.width = '200px';
			});

			await test.expect(component).toHaveCSS('margin-top', '10px');
			await test.expect(component).toHaveAttribute('data-counter', '3');
		});
	});

	test.describe('should support listening to component events', () => {
		test('for non-functional components', async ({page}) => {
			const target = await renderComponentWithVAttrs<bComponentDirectivesAttrsDummy>(page, 'b-component-directives-attrs-dummy', {
				'@delete': deleteHandler
			});

			const button = page.getByTestId('deleteButton');

			await button.click();

			await button.click();

			await test.expect(target.evaluate((el) => el.counter)).resolves.toBe(2);
		});

		test('for functional components', async ({page}) => {
			const target = await renderComponentWithVAttrs<bComponentDirectivesAttrsDummy>(page, 'b-component-directives-attrs-dummy-functional', {
				'@delete': deleteHandler
			});

			const button = page.getByTestId('deleteButton');

			await button.click();

			await button.click();

			await test.expect(target.evaluate((el) => el.counter)).resolves.toBe(2);
		});

		test('the component event handler cannot have modifiers', async ({page}) => {
			const target = await renderComponentWithVAttrs<bComponentDirectivesAttrsDummy>(page, 'b-component-directives-attrs-dummy', {
				'@delete.delete': deleteHandler
			});

			const button = page.getByTestId('deleteButton');

			await button.click();

			await button.click();

			await test.expect(target.evaluate((el) => el.counter)).resolves.toBe(0);
		});

		function deleteHandler(target: bComponentDirectivesAttrsDummy): void {
			target.counter++;
		}
	});
});
