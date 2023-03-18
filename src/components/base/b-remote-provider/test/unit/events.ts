/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page, JSHandle } from 'playwright';

import { StatusCodes } from '@v4fire/core/src/core/status-codes';

import type bRemoteProvider from 'components/base/b-remote-provider/b-remote-provider';
import type * as Provider from 'components/friends/data-provider';

import test from 'tests/config/unit/test';
import Utils from 'tests/helpers/utils';

import { renderProvider, mockAPIResponse } from 'components/base/b-remote-provider/test/helpers';

test.describe('b-remote-provider: should emit events and recieve proper data', () => {
	const
		body = {data: 21};

	let provider: JSHandle<bRemoteProvider>;

	test.beforeEach(async ({demoPage, page, context}) => {
		await demoPage.goto();

		[provider] = await Promise.all([
			renderProviderComponent(page),
			setupBaseDataProviderAPI(page),
			mockAPIResponse(context, body)
		]);
	});

	test('initially loads data and emits `change` event', async () => {
		const response = await provider.evaluate((ctx) => new Promise((resolve) => {
			ctx.once('change', (_, val) => resolve(JSON.parse(val)));
			void ctx.reload();
		}));

		test.expect(response).toEqual(body);
	});

	test('adds new data to the already existed one and emits `addData` event', async () => {
		const response = await provider.evaluate((ctx) => new Promise((resolve) => {
			ctx.once('addData', (_, val) => resolve(JSON.parse(val)));
			ctx.dataProvider?.add();
		}));

		test.expect(response).toEqual(body);
	});

	test('notifies about data update and emits `updateData` event', async () => {
		const response = await provider.evaluate((ctx) => new Promise((resolve) => {
			ctx.once('updateData', (_, val) => resolve(JSON.parse(val)));
			ctx.dataProvider?.update();
		}));

		test.expect(response).toEqual(body);
	});

	test('notifies about data deletion and emits `deleteData` event', async () => {
		const
			data = {deleted: true};

		const response = await provider.evaluate((ctx, data) => new Promise((resolve) => {
			ctx.once('deleteData', () => resolve(data));
			ctx.dataProvider?.delete();
		}), data);

		test.expect(response).toEqual(data);
	});

	test('catches request error and emits `error` event', async ({context}) => {
		const
			errorData = {foo: 'bar'};

		await mockAPIResponse(context, errorData, StatusCodes.INTERNAL_SERVER_ERROR);

		const response = await provider.evaluate((ctx, errorData) => new Promise((resolve) => {
			ctx.once('error', () => resolve(errorData));
			void ctx.reload();
		}), errorData);

		test.expect(response).toEqual(errorData);
	});

	/**
	 * @param page
	 */
	async function setupBaseDataProviderAPI(page: Page): Promise<void> {
		const api = await Utils.import<typeof Provider>(page, 'components/friends/data-provider');

		await api.evaluate(({default: dataProvider, deleteData, ...restCtx}) => {
			dataProvider.addToPrototype({
				delete: deleteData,
				...restCtx
			});
		});
	}

	/**
	 * @param page
	 */
	async function renderProviderComponent(page: Page): Promise<JSHandle<bRemoteProvider>> {
		const log = (...args: unknown[]) => console.log(...args);

		return renderProvider(page, {
			dataProvider: 'Provider',
			'@addData': log,
			'@updateData': log,
			'@deleteData': log
		});
	}
});
