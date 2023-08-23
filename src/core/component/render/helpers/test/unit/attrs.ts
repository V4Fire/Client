/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Locator, Page } from 'playwright';

import test from 'tests/config/unit/test';

import { Component } from 'tests/helpers';

import type bDummy from 'components/dummies/b-dummy/b-dummy';

test.describe('core/component/render/helpers/attrs', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test.describe('`style`', () => {
		test('should be passed to a regular component', async ({page}) => {
			await renderDummy(page);

			await assertElementHasCorrectStyles(page.locator('.b-dummy'));
		});

		test('should be passed to a functional component', async ({page}) => {
			const target = await renderDummy(page, 'b-dummy-functional');

			await test.expect(target.evaluate((ctx) => ctx.isFunctional)).resolves.toBeTruthy();

			await assertElementHasCorrectStyles(page.locator('.b-dummy'));
		});

		async function renderDummy(page: Page, componentName: string = 'b-dummy'): Promise<JSHandle<bDummy>> {
			return Component.createComponent(page, componentName, {
				style: ['background-color: red; color: blue', {'font-size': '12px'}]
			});
		}

		/**
		 * Verifies if the specified locator has the required CSS
		 * @param locator
		 */
		async function assertElementHasCorrectStyles(locator: Locator): Promise<void> {
			await test.expect(locator).toHaveCSS('background-color', 'rgb(255, 0, 0)');
			await test.expect(locator).toHaveCSS('color', 'rgb(0, 0, 255)');
			await test.expect(locator).toHaveCSS('font-size', '12px');
		}
	});
});
