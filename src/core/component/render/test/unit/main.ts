/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';
import { Component } from 'tests/helpers';
import type bReactiveWrapperDummy from 'core/component/render/test/b-reactive-wrapper-dummy/b-reactive-wrapper-dummy';

test.describe('props reactivity', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('changing the prop should cause the component to rerender', async ({page}) => {
		const target = await Component.createComponent<bReactiveWrapperDummy>(page, 'b-reactive-wrapper-dummy', {
			stage: 'reactive enabled'
		});

		const text = await page.getByText('Content');
		await test.expect(text).toHaveText('Content: foo');
		await target.evaluate((ctx) => ctx.someField = 'bar');
		await test.expect(text).toHaveText('Content: bar');

	});

	test('changing the prop with disabled reactivity should not cause the component to rerender', async ({page}) => {
		const target = await Component.createComponent<bReactiveWrapperDummy>(page, 'b-reactive-wrapper-dummy', {
			stage: 'reactive disabled'
		});

		const text = await page.getByText('Content');
		await test.expect(text).toHaveText('Content: foo');
		await target.evaluate((ctx) => ctx.someField = 'bar');
		await test.expect(text).toHaveText('Content: foo');
	});

});
