/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page, JSHandle } from 'playwright';

import { StatusCodes } from 'core/status-codes';
import type * as Provider from 'components/friends/data-provider';

import test from 'tests/config/unit/test';
import Utils from 'tests/helpers/utils';
import Component from 'tests/helpers/component';

import type bRemoteProvider from 'components/base/b-remote-provider/b-remote-provider';
import { mockAPI } from 'components/base/b-remote-provider/test/helpers';

test.describe('<b-remote-provider> standard component events', () => {
	const
		body = {data: 21};

	let
		provider: JSHandle<bRemoteProvider>;

	test.beforeEach(async ({demoPage, page, context}) => {
		await demoPage.goto();
		await mockAPI(context, body);

		const api = await Utils.import<typeof Provider>(page, 'components/friends/data-provider');

		await api.evaluate(({default: dataProvider, deleteData, ...restCtx}) => {
			dataProvider.addToPrototype({
				delete: deleteData,
				...restCtx
			});
		});

		provider = await renderProvider(page);
	});

	test('every time the provider loads new data, it should emit a `change` event', async () => {
		const res = await provider.evaluate((ctx) => new Promise((resolve) => {
			ctx.once('change', (_, val) => resolve(JSON.parse(val)));
			void ctx.reload();
		}));

		test.expect(res).toEqual(body);
	});

	test('when the `add` method is called on the provider, it should add the data and emit an `addData` event', async () => {
		const res = await provider.evaluate((ctx) => new Promise((resolve) => {
			ctx.once('addData', (_, val) => resolve(JSON.parse(val)));
			void ctx.dataProvider?.add();
		}));

		test.expect(res).toEqual(body);
	});

	test('when the `update` method is called on the provider, it should add the data and emit an `updateData` event', async () => {
		const res = await provider.evaluate((ctx) => new Promise((resolve) => {
			ctx.once('updateData', (_, val) => resolve(JSON.parse(val)));
			void ctx.dataProvider?.update();
		}));

		test.expect(res).toEqual(body);
	});

	test('when the `delete` method is called on the provider, it should add the data and emit an `deleteData` event', async () => {
		const
			data = {deleted: true};

		const res = await provider.evaluate((ctx, data) => new Promise((resolve) => {
			ctx.once('deleteData', () => resolve(data));
			void ctx.dataProvider?.delete();
		}), data);

		test.expect(res).toEqual(data);
	});

	test('the component catches any errors that occur when working with the provider and emits an `error` event', async ({context}) => {
		const errorData = {error: 'foo'};
		await mockAPI(context, errorData, StatusCodes.INTERNAL_SERVER_ERROR);

		const res = await provider.evaluate((ctx, errorData) => new Promise((resolve) => {
			ctx.once('error', () => resolve(errorData));
			void ctx.reload();
		}), errorData);

		test.expect(res).toEqual(errorData);
	});

	function renderProvider(page: Page, attrs: RenderComponentsVnodeParams['attrs'] = {}): Promise<JSHandle<bRemoteProvider>> {
		return Component.createComponent(page, 'b-remote-provider', {
			attrs: {
				dataProvider: 'Provider',
				'@addData': log,
				'@updateData': log,
				'@deleteData': log,
				...attrs
			}
		});

		function log(...args: unknown[]) {
			// eslint-disable-next-line no-console
			console.log(...args);
		}
	}
});
