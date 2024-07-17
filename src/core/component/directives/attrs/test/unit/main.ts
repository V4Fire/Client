/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import {

	renderDirective,
	renderDummy,

	resizeHandler,
	clickHandler,

	waitForWatcherCallsCount,
	dummyDeleteHandler

} from 'core/component/directives/attrs/test/helpers';

test.describe('core/component/directives/attrs', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('should allow setting regular props or attributes', async ({page}) => {
		const component = await renderDirective(page, 'b-dummy', {
			style: 'margin-top: 10px;',
			class: 'croatoan'
		});

		await test.expect(component).toHaveClass(/croatoan/);
		await test.expect(component).toHaveCSS('margin-top', '10px');
	});

	test('should allow setting event listeners with support of Vue modifiers', async ({page}) => {
		const component = await renderDirective(page, 'b-dummy', {
			'@click.once': clickHandler
		});

		await component.click();

		await component.click();

		await test.expect(component).toHaveAttribute('data-counter', '1');
	});

	test('should allow setting Vue directives', async ({page}) => {
		const component = await renderDirective(page, 'b-dummy', {
			'v-show': false
		});

		await test.expect(component).toHaveCSS('display', 'none');
	});

	test('should allow setting custom directives', async ({page}) => {
		const component = await renderDirective(page, 'b-dummy', {
			'v-on-resize': resizeHandler
		});

		await component.evaluate((div) => {
			div.style.width = '200px';
		});

		await test.expect(waitForWatcherCallsCount(page, component, 2)).toBeResolved();
	});

	test('should allow specifying directives, events, and attributes simultaneously', async ({page}) => {
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

	test('should allow specifying directives, events, and attributes simultaneously for functional components', async ({page}) => {
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

	test('should work correctly with an event named as a registered key modifier', async ({page}) => {
		const target = await renderDummy(page, {
			'@delete': dummyDeleteHandler
		});

		const button = page.getByTestId('deleteButton');

		await button.click();

		await button.click();

		await test.expect(target.evaluate((el) => el.counter)).resolves.toBe(2);
	});

	test(
		[
			'should correctly handle registered keys modifiers:',
			'our handler should be replaced by the registered handler'
		].join(' '),

		async ({page}) => {
			const target = await renderDummy(page, {
				'@delete.delete': dummyDeleteHandler
			});

			const button = page.getByTestId('deleteButton');

			await button.click();

			await button.click();

			await test.expect(target.evaluate((el) => el.counter)).resolves.toBe(0);
		}
	);
});
