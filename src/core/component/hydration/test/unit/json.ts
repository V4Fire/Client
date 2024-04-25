/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */
import type { JSHandle, Page } from 'playwright';

import test from 'tests/config/unit/test';
import { Utils } from 'tests/helpers';

import type * as Hydration from 'core/component/hydration';

test.describe('core/component/hydration converting to JSON', () => {
	let
		hydrationAPI: JSHandle<typeof Hydration>,
		serverHydrationStore: JSHandle<Hydration.HydrationStore>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		hydrationAPI = await Utils.import<typeof Hydration>(page, 'core/component/hydration');
		serverHydrationStore = await hydrationAPI.evaluateHandle((ctx) => new ctx.HydrationStore('server'));
	});

	test('should correctly convert the store to JSON', async ({page}) => {
		await serverHydrationStore.evaluate((ctx) => ctx.set('componentId', 'foo', {bar: 'baz'}));

		await appendJSONToDOM(page);

		const clientHydrationStore = await hydrationAPI.evaluateHandle((ctx) => new ctx.HydrationStore('client'));

		const valueById = await clientHydrationStore.evaluate((ctx) => ctx.get('componentId'));
		await test.expect(valueById).toEqual({foo: {bar: 'baz'}});

		const valueByPath = await clientHydrationStore.evaluate((ctx) => ctx.getByPath('componentId', 'foo'));
		await test.expect(valueByPath).toEqual({bar: 'baz'});
	});

	test('should remove value from the JSON store when it is removed from the store', async ({page}) => {
		await serverHydrationStore.evaluate((ctx) => ctx.set('componentId', 'foo', {bar: 'baz'}));

		await serverHydrationStore.evaluate((ctx) => ctx.remove('componentId'));

		await appendJSONToDOM(page);

		const clientHydrationStore = await hydrationAPI.evaluateHandle((ctx) => new ctx.HydrationStore('client'));

		const valueById = await clientHydrationStore.evaluate((ctx) => ctx.get('componentId'));
		await test.expect(valueById).toBeUndefined();
	});

	test('should remove value from the JSON store when it is removed by path from the store', async ({page}) => {
		await serverHydrationStore.evaluate((ctx) => ctx.set('componentId', 'foo', {bar: 'baz'}));

		await serverHydrationStore.evaluate((ctx) => ctx.removeByPath('componentId', 'foo'));

		await appendJSONToDOM(page);

		const clientHydrationStore = await hydrationAPI.evaluateHandle((ctx) => new ctx.HydrationStore('client'));

		const valueByPath = await clientHydrationStore.evaluate((ctx) => ctx.getByPath('componentId', 'foo'));
		await test.expect(valueByPath).toBeUndefined();
	});

	test('should clear the JSON store when the store is cleared', async ({page}) => {
		await serverHydrationStore.evaluate((ctx) => ctx.set('componentId', 'foo', {bar: 'baz'}));

		await serverHydrationStore.evaluate((ctx) => ctx.clear());

		await appendJSONToDOM(page);

		const clientHydrationStore = await hydrationAPI.evaluateHandle((ctx) => new ctx.HydrationStore('client'));

		const valueById = await clientHydrationStore.evaluate((ctx) => ctx.get('componentId'));
		await test.expect(valueById).toBeUndefined();
	});

	test('should set empty object to the JSON store when the store is set empty', async ({page}) => {
		await serverHydrationStore.evaluate((ctx) => ctx.set('componentId', 'foo', {bar: 'baz'}));
		await serverHydrationStore.evaluate((ctx) => ctx.setEmpty('componentId', 'foo'));

		await appendJSONToDOM(page);

		const clientHydrationStore = await hydrationAPI.evaluateHandle((ctx) => new ctx.HydrationStore('client'));

		const valueByPath = await clientHydrationStore.evaluate((ctx) => ctx.getByPath('componentId', 'foo'));
		await test.expect(valueByPath).toBeUndefined();
	});

	/**
	 * Appends the JSON store to the DOM
	 * @param page
	 */
	async function appendJSONToDOM(page: Page): Promise<void> {
		const json = await serverHydrationStore.evaluate((ctx) => ctx.toString());

		await page.evaluate(([json]) => {
			const div = document.createElement('div');
			div.innerHTML = `<noframes id="hydration-store" style="display: none">${json}</noframes>`;
			document.body.appendChild(div);
		}, [json]);
	}
});
