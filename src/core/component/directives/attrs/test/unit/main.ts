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

	test('the directive works correctly with event named as registered key modifier', async ({page}) => {
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
			'the directive correctly handles registered keys modifiers.',
			'Our handler should be replaced by registered keys handler'
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
