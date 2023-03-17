/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { BrowserContext, JSHandle, Page } from 'playwright';
import type bRemoteProvider from 'components/base/b-remote-provider/b-remote-provider';

import test from 'tests/config/unit/test';
import Component from 'tests/helpers/component';

test.describe('<b-remote-provider>', () => {
	test.beforeEach(({demoPage}) => demoPage.goto());

	test('the component markup should have a <b-remote-provider /> tag with the provided attributes', async ({page}) => {
		const
			id = 'foo',
			dataVal = 'bar';

		await renderProvider(page, {
			id,
			'data-val': dataVal
		});

		const
			provider = await page.$(`#${id}`);

		test.expect(provider).not.toBeNull();

		const attrs = await provider!.evaluate((ctx) => [
			ctx.id,
			ctx.dataset.val
		]);

		test.expect(attrs).toEqual([id, dataVal]);
	});

	test.describe('should emit events and recieve proper data', () => {
		const
			body = {data: 21};

		let provider: JSHandle<bRemoteProvider>;

		test.beforeEach(async ({page, context}) => {
			await mockAPI(context, body);

			provider = await renderProvider(page, {
				dataProvider: 'Provider'
			});
		});

		test('change: the data has been uploaded', async () => {
			const response = await provider.evaluate((ctx) => new Promise((resolve) => {
				ctx.once('change', (_, val) => resolve(JSON.parse(val)));
				void ctx.reload();
			}));

			test.expect(response).toEqual(body);
		});

		test('addData: new data has been added', async () => {
			const
				newData = {foo: 'bar'};

			const response = await provider.evaluate((ctx, newData) => new Promise((resolve) => {
				ctx.once('addData', (_, val) => resolve(val));
				ctx.dataProvider?.add(newData);
			}), newData);

			test.expect(response).toEqual(newData);
		});

		test('updateData: the data has been updaded', async () => {
			const response = await provider.evaluate((ctx) => new Promise((resolve) => {
				ctx.once('updateData', (_, val) => resolve(val));
				ctx.dataProvider?.update();
			}));

			test.expect(response).toEqual(body);
		});

		test('deleteData: the data has been deleted', async () => {
			const
				data = {deleted: true};

			const response = await provider.evaluate((ctx, data) => new Promise((resolve) => {
				ctx.once('deleteData', () => resolve(data));
				ctx.dataProvider?.delete();
			}), data);

			test.expect(response).toEqual(data);
		});

		test('error: something went wrong with the provider', async ({context}) => {
			const
				errorData = {foo: 'bar'};

			await mockAPI(context, errorData, 500);

			const response = await provider.evaluate((ctx, errorData) => new Promise((resolve) => {
				ctx.once('error', () => resolve(errorData));
				void ctx.reload();
			}), errorData);

			test.expect(response).toEqual(errorData);
		});
	});

	test('stores the `db` field to the parent component field', async ({page, context}) => {
		const
			data = {foo: 'bar'},
			field = 'foo-bar-baz';

		await mockAPI(context, data);

		const provider = await renderProvider(page, {
			dataProvider: 'Provider',
			field
		});

		const val = await provider.evaluate((ctx, field) => ctx.$parent?.field.get(field), field);

		test.expect(val).toBeDefined();
		test.expect(JSON.parse(val!)).toEqual(data);
	});

	/**
	 * @param page
	 * @param attrs
	 */
	async function renderProvider(page: Page, attrs: Dictionary = {}): Promise<JSHandle<bRemoteProvider>> {
		return Component.createComponent(page, 'b-remote-provider', {
			attrs
		});
	}

	/**
	 * @param context
	 * @param status
	 * @param val
	 */
	function mockAPI(
		context: BrowserContext,
		val: any,
		status: number = 200
	): Promise<void> {
		return context.route('/api', (route) => route.fulfill({
			status,
			body: JSON.stringify(val)
		}));
	}
});
