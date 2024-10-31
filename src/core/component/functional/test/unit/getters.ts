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

test.describe('functional component getters', () => {
	let
		target: JSHandle<bFunctionalDummy>,
		text: Locator;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		target = await Component.createComponent<bFunctionalDummy>(page, 'b-functional-dummy', {stage: 'getters'});
		
		// await Promise.all([
		// 	Component.waitForComponentTemplate(page, 'b-functional-dummy'),
		// 	Component.waitForComponentTemplate(page, 'b-functional-button-dummy')
		// ]);

		text = page.getByText(/Value/);
	});

	test('should not be cached during the render', async () => {
		await test.expect(text).toHaveText('Value: 3.14');
		await target.evaluate((ctx) => ctx.counter++);
		await test.expect(text).toHaveText('Value: 3.14');

		const log = await target.evaluate((ctx) => ctx.unsafe.$refs.gettersDummy!.logStore);

		test.expect(log).toEqual([
			'Hook: mounted. Value is cached: false',
			'Hook: beforeDestroy. Value is cached: true',
			'Hook: mounted. Value is cached: false'
		]);
	});
});
