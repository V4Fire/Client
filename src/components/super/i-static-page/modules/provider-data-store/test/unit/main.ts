/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import test from 'tests/config/unit/test';

import { Component } from 'tests/helpers';

import type bRemoteProvider from 'components/base/b-remote-provider/b-remote-provider';

test.describe('<i-static-page> provider data store', () => {
	test.beforeEach(async ({demoPage, page}) => {
		await page.route(/api/, async (route) => route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify([
				{label: 'Foo', value: 'foo'},
				{label: 'Bar', value: 'bar'}
			])
		}));

		await demoPage.goto();
	});

	test('should get a provider data by a provider name', async ({page}) => {
		const target = await renderRemoteProvider(page, {
			dataProvider: 'Provider'
		});

		const data = await target.evaluate((ctx) =>
			Object.fastClone(ctx.r.providerDataStore?.get('Provider')?.select({where: {label: 'Foo'}})));

		test.expect(data).toEqual({label: 'Foo', value: 'foo'});
	});

	test('should get a provider data by a `globalName`', async ({page}) => {
		const target = await renderRemoteProvider(page, {
			globalName: 'foo',
			dataProvider: 'Provider'
		});

		const data = await target.evaluate((ctx) =>
			Object.fastClone(ctx.r.providerDataStore?.get('foo')?.select({where: {label: 'Foo'}})));

		test.expect(data).toEqual({label: 'Foo', value: 'foo'});
	});

	async function renderRemoteProvider(
		page: Page,
		attrs: RenderComponentsVnodeParams['attrs'] = {}
	): Promise<JSHandle<bRemoteProvider>> {
		await Component.createComponent(
			page,
			'b-remote-provider',
			[{attrs: {...attrs, id: 'target'}}]
		);

		return Component.waitForComponentStatus(page, '#target', 'ready');
	}
});
