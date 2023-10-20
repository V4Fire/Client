/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page } from 'playwright';

import test from 'tests/config/unit/test';

import { Component, DOM } from 'tests/helpers';

test.describe('friends/module-loader', () => {
	const
		componentName = 'b-friends-module-loader-dummy',
		resultSelector = DOM.elNameSelectorGenerator(componentName, 'result');

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('should load dynamic modules from the template using `loadModules`', async ({page}) => {
		const target = await renderDummy(page, 'loading dynamic modules from a template');

		await target.evaluate((ctx) => ctx.unsafe.localEmitter.promisifyOnce('asyncRenderComplete'));

		await test.expect(page.locator(resultSelector)).toHaveText([
			'Dummy module #1',
			'Dummy module #1',
			'Dummy module #2'
		].join(' '));
	});

	test('should load dynamic modules passed from the prop', async ({page}) => {
		await page.evaluate(() => {
			globalThis.loadFromProp = true;
		});

		const target = await renderDummy(page, 'loading dynamic modules passed from the prop');

		await target.evaluate(async (ctx) => ctx.waitComponentStatus('ready'));

		await test.expect(page.locator(resultSelector)).toHaveText([
			'Dummy module #1',
			'Dummy module #2'
		].join(' '));
	});

	/**
	 * Returns the rendered `b-friends-module-loader-dummy` component
	 *
	 * @param page
	 * @param stage
	 */
	async function renderDummy(page: Page, stage: string) {
		await Component.waitForComponentTemplate(page, componentName);
		return Component.createComponent(page, componentName, {stage});
	}
});
