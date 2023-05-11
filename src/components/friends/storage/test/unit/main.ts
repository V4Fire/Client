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

import type bDummy from 'components/dummies/b-dummy/b-dummy';

test.describe('friends/storage', () => {

	let target: JSHandle<bDummy>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		target = await Component.createComponent(page, 'b-dummy');
		await target.evaluate((ctx) => ctx.unsafe.storage.set({value: 1}, 'testKey'));
	});

	test.describe('`get`', () => {
		test('should return data for the specified key', async () => {
			const testVal = await target.evaluate((ctx) => ctx.unsafe.storage.get('testKey'));

			test.expect(testVal).toEqual({value: 1});
		});

		test('should return `undefined` if there is no data for the specified key', async () => {
			const testVal = await target.evaluate((ctx) => ctx.unsafe.storage.get('unreachableKey'));

			test.expect(testVal).toBeUndefined();
		});
	});

	test.describe('`set`', () => {
		test('should save the specified data under the specified key', async () => {
			await target.evaluate((ctx) => ctx.unsafe.storage.set({value: 1}, 'newTestKey'));

			const testVal = await target.evaluate((ctx) => ctx.unsafe.storage.get('newTestKey'));

			test.expect(testVal).toEqual({value: 1});
		});
	});

	test.describe('`remove`', () => {
		test('should remove data for the specified key', async () => {
			await target.evaluate((ctx) => ctx.unsafe.storage.remove('testKey'));

			const testVal = await target.evaluate((ctx) => ctx.unsafe.storage.get('testKey'));

			test.expect(testVal).toBeUndefined();
		});
	});
});
