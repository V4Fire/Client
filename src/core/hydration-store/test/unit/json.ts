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

import type * as Hydration from 'core/hydration-store';

test.describe('core/component/hydration converting to JSON', () => {
	let
		hydrationAPI: JSHandle<typeof Hydration>,
		serverHydrationStore: JSHandle<Hydration.default>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		hydrationAPI = await Utils.import<typeof Hydration>(page, 'core/hydration-store');
		serverHydrationStore = await hydrationAPI.evaluateHandle(({default: HydrationStore}) => new HydrationStore('server'));
	});

	test('should correctly convert the store to JSON', async ({page}) => {
		await serverHydrationStore.evaluate((ctx) => ctx.set('componentId', 'foo', {bar: 'baz'}));

		await appendJSONToDOM(page);

		const clientHydrationStore = await hydrationAPI.evaluateHandle(({default: HydrationStore}) => new HydrationStore('client'));

		const valueById = await clientHydrationStore.evaluate((ctx) => ctx.get('componentId'));
		test.expect(valueById).toEqual({foo: {bar: 'baz'}});

		const valueByPath = await clientHydrationStore.evaluate((ctx) => ctx.get('componentId', 'foo'));
		test.expect(valueByPath).toEqual({bar: 'baz'});
	});

	test('should not add harmful HTML to the JSON', async ({page}) => {
		await serverHydrationStore.evaluate((ctx) => {
			ctx.set('componentId', 'foo', {
				bar: 'baz',
				foo: '<script>alert(1)</script>'
			});
		});

		await appendJSONToDOM(page);

		const clientHydrationStore = await hydrationAPI.evaluateHandle(({default: HydrationStore}) => new HydrationStore('client'));

		const valueByPath = await clientHydrationStore.evaluate((ctx) => ctx.get('componentId', 'foo'));
		test.expect(valueByPath).toEqual({bar: 'baz', foo: ''});
	});

	test('should remove value from the JSON store when it is removed from the store', async ({page}) => {
		await serverHydrationStore.evaluate((ctx) => {
			ctx.set('componentId', 'foo', {bar: 'baz'});
			ctx.remove('componentId');
		});

		await appendJSONToDOM(page);

		const clientHydrationStore = await hydrationAPI.evaluateHandle(({default: HydrationStore}) => new HydrationStore('client'));

		const valueById = await clientHydrationStore.evaluate((ctx) => ctx.get('componentId'));
		test.expect(valueById).toBeUndefined();
	});

	test('should remove value from the JSON store when it is removed by path from the store', async ({page}) => {
		await serverHydrationStore.evaluate((ctx) => {
			ctx.set('componentId', 'foo', {bar: 'baz'});
			ctx.remove('componentId', 'foo');
		});

		await appendJSONToDOM(page);

		const clientHydrationStore = await hydrationAPI.evaluateHandle(({default: HydrationStore}) => new HydrationStore('client'));

		const valueByPath = await clientHydrationStore.evaluate((ctx) => ctx.get('componentId', 'foo'));
		test.expect(valueByPath).toBeUndefined();
	});

	test('should clear the JSON store when the store is cleared', async ({page}) => {
		await serverHydrationStore.evaluate((ctx) => {
			ctx.set('componentId', 'foo', {bar: 'baz'});
			ctx.clear();
		});

		await appendJSONToDOM(page);

		const clientHydrationStore = await hydrationAPI.evaluateHandle(({default: HydrationStore}) => new HydrationStore('client'));

		const valueById = await clientHydrationStore.evaluate((ctx) => ctx.get('componentId'));
		test.expect(valueById).toBeUndefined();
	});

	test('should set empty object to the JSON store when the store is set empty', async ({page}) => {
		await serverHydrationStore.evaluate((ctx) => {
			ctx.set('componentId', 'foo', {bar: 'baz'});
			ctx.setEmpty('componentId', 'foo');
		});

		await appendJSONToDOM(page);

		const clientHydrationStore = await hydrationAPI.evaluateHandle(({default: HydrationStore}) => new HydrationStore('client'));

		const valueByPath = await clientHydrationStore.evaluate((ctx) => ctx.get('componentId', 'foo'));
		test.expect(valueByPath).toBeUndefined();
	});

	async function appendJSONToDOM(page: Page): Promise<void> {
		const json = await serverHydrationStore.evaluate((ctx) => ctx.toString());

		await page.evaluate(([json]) => {
			const div = document.createElement('div');
			div.innerHTML = `<noframes id="hydration-store" style="display: none;">${json}</noframes>`;
			document.body.appendChild(div);
		}, [json]);
	}
});
