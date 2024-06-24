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
import type bFunctionalGettersDummy from 'core/component/functional/test/b-functional-getters-dummy/b-functional-getters-dummy';

test.describe('functional component getters', () => {
	let
		target: JSHandle<bFunctionalDummy>,
		dummy: JSHandle<bFunctionalGettersDummy>,
		text: Locator;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		await Promise.all([
			Component.waitForComponentTemplate(page, 'b-functional-dummy'),
			Component.waitForComponentTemplate(page, 'b-functional-button-dummy')
		]);

		target = await Component.createComponent<bFunctionalDummy>(page, 'b-functional-dummy', {stage: 'getters'});
		text = page.getByText(/Value/);
		dummy = await target.evaluateHandle((ctx) => ctx.unsafe.$refs.gettersDummy!);
	});

	test.describe('on re-create', () => {
		test('should reset getters cache', async () => {
			// TODO: improve test clarity
			await test.expect(text).toHaveText('Value: 3.14');
			await target.evaluate((ctx) => ctx.counter++);
			await test.expect(text).toHaveText('Value: 3.14');
		});
	});
});
