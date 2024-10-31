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

		target = await Component.createComponent<bFunctionalDummy>(page, 'b-functional-dummy', {stage: 'main'});
		text = page.getByText(/Counter/);
		button = page.getByRole('button');
	});

	test.describe('on parent re-render', () => {
		test('should have valid event handlers', async () => {
			await clickAndWaitForEvent();
			await test.expect(text).toHaveText('Counter: 0');

			await target.evaluate((ctx) => ctx.syncStoreWithState());
			await test.expect(text).toHaveText('Counter: 1');

			await clickAndWaitForEvent();
		});

		test('should reset counters on vnode unmount', async () => {
			await test.expect(clickAndGetCounts()).resolves.toEqual([1, 1]);

			const clicks = await target.evaluate((ctx) => {
				const button = ctx.unsafe.$refs.button!;
				button.unsafe.$destroy();

				const {clickCount, uniqueClickCount} = button;
				return [clickCount, uniqueClickCount];
			});

			test.expect(clicks).toEqual([0, 0]);
		});

		test([
			'should handle system properties correctly:',
			'reset the unique ones and keep the regular ones'
		].join(' '), async () => {
			await test.expect(clickAndGetCounts()).resolves.toEqual([1, 1]);
			await test.expect(clickAndGetCounts()).resolves.toEqual([2, 2]);

			await target.evaluate((ctx) => ctx.syncStoreWithState());
			await test.expect(clickAndGetCounts()).resolves.toEqual([3, 1]);
		});

		async function clickAndWaitForEvent() {
			const promise = target.evaluate((ctx) => ctx.unsafe.$refs.button!.promisifyOnce('click:component'));
			await button.click();
			await test.expect(promise).toBeResolved();
		}

		async function clickAndGetCounts() {
			await button.click();
			return target.evaluate((ctx) => {
				const {clickCount, uniqueClickCount} = ctx.unsafe.$refs.button!;
				return [clickCount, uniqueClickCount];
			});
		}

	});
});
