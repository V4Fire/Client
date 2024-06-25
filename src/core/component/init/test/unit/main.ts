/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';

import test from 'tests/config/unit/test';
import { Component } from 'tests/helpers';

import type bTestComponent from 'core/component/init/test/b-test-component/b-test-component';
import type { ComponentElement } from 'core/component';

test.describe('core init component deactivation', () => {
	let
		target: JSHandle<bTestComponent>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		target = await Component.createComponent<bTestComponent>(page, 'b-test-component');
	});

	test('children button should be deactivated', async ({page}) => {
		await target.evaluate((x) => x.deactivate());

		test.expect(await page.locator('#button1').evaluate((el: ComponentElement) => el.component?.hook)).toBe('deactivated');
	});

	test('button on teleported component should be deactivated', async ({page}) => {
		await target.evaluate((x) => x.deactivate());

		test.expect(await page.locator('#button2').evaluate((el: ComponentElement) => el.component?.hook)).toBe('deactivated');
	});

});
