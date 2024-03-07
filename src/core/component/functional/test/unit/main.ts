/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Locator } from 'playwright';

import test from 'tests/config/unit/test';
import { Component } from 'tests/helpers';

import type bFunctionalDummy from 'core/component/functional/test/b-functional-dummy/b-functional-dummy';

test.describe('functional component', () => {
	let
		target: JSHandle<bFunctionalDummy>,
		text: Locator,
		button: Locator;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		await Promise.all([
			Component.waitForComponentTemplate(page, 'b-functional-dummy'),
			Component.waitForComponentTemplate(page, 'b-functional-button-dummy')
		]);

		target = await Component.createComponent<bFunctionalDummy>(page, 'b-functional-dummy');
		text = page.getByText(/Click count/);
		button = page.getByRole('button');
	});

	test.describe('on parent re-render', () => {
		test('should have valid event handlers', async () => {
			const clickAndWaitForEvent = async () => {
				const promise = target.evaluate((ctx) => ctx.unsafe.$refs.button.promisifyOnce('click:component'));
				await button.click();
				await test.expect(promise).toBeResolved();
			};

			await clickAndWaitForEvent();
			await test.expect(text).toHaveText('Click count: 0');

			await target.evaluate((ctx) => ctx.updateClickCount());
			await test.expect(text).toHaveText('Click count: 1');

			await clickAndWaitForEvent();
		});

		test([
			'should handle system properties correctly:',
			'reset the unique ones and keep the regular ones'
		].join(' '), async () => {
			const clickAndGetCounts = async () => {
				await button.click();
				return target.evaluate((ctx) => {
					const {clickCount, uniqueClickCount} = ctx.unsafe.$refs.button;
					return [clickCount, uniqueClickCount];
				});
			};

			await test.expect(clickAndGetCounts()).resolves.toEqual([1, 1]);
			await test.expect(clickAndGetCounts()).resolves.toEqual([2, 2]);

			await target.evaluate((ctx) => ctx.updateClickCount());
			await test.expect(clickAndGetCounts()).resolves.toEqual([3, 1]);
		});
	});
});
