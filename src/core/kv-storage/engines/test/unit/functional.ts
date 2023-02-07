/* eslint-disable new-cap */
/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';

import type * as Cookies from 'core/cookies';

import type CookieStorageEngine from 'core/kv-storage/engines/cookie/engine';

import test from 'tests/config/unit/test';
import Utils from 'tests/helpers/utils';

test.describe('core/cookies', () => {
	let
		cookie: JSHandle<typeof Cookies>,
		cookieStorage: JSHandle<{default: typeof CookieStorageEngine}>;

	const
		cookieName = 'cookieName',
		defaultStorage = 'key1{{.}}val1{{#}}key2{{.}}val2';

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		cookie = await Utils.import(page, 'core/cookies');
		cookieStorage = await Utils.import(page, 'core/kv-storage/engines/cookie-storage.ts');
	});

	test.afterEach(async () => {
		await cookie.evaluate((ctx, [cookieName]) => ctx.remove(cookieName), [cookieName]);
	});

	test.describe('`get`', () => {
		test.beforeEach(async () => {
			await cookie.evaluate(
				(ctx, [cookieName, defaultStorage]) => ctx.set(cookieName, defaultStorage), [cookieName, defaultStorage]
			);
		});

		test('returns a value from valid key', async () => {
			const
				testVal = await cookieStorage.evaluate((ctx, [cookieName]) => new ctx.default(cookieName).get('key1'), [cookieName]);

			test.expect(testVal).toBe('val1');
		});

		test('returns `undefined` when trying to get a value of the non-existent key', async () => {
			const
				testVal = await cookieStorage.evaluate((ctx, [cookieName]) => new ctx.default(cookieName).get('non-existing-key'), [cookieName]);

			test.expect(testVal).toBeUndefined();
		});
	});

	test.describe('`has`', () => {
		test.beforeEach(async () => {
			await cookie.evaluate(
				(ctx, [cookieName, defaultStorage]) => ctx.set(cookieName, defaultStorage), [cookieName, defaultStorage]
			);
		});

		test('returns true if value exist', async () => {
			const
				testVal = await cookieStorage.evaluate((ctx, [cookieName]) => new ctx.default(cookieName).has('key1'), [cookieName]);

			test.expect(testVal).toBe(true);
		});

		test('returns false when trying to check of the non-existent key', async () => {
			const
				testVal = await cookieStorage.evaluate((ctx, [cookieName]) => new ctx.default(cookieName).has('non-existing-key'), [cookieName]);

			test.expect(testVal).toBe(false);
		});
	});

	test.describe('`remove`', () => {
		test.beforeEach(async () => {
			await cookie.evaluate(
				(ctx, [cookieName, defaultStorage]) => ctx.set(cookieName, defaultStorage), [cookieName, defaultStorage]
			);
		});

		test('remove value from cookie', async () => {
			await cookieStorage.evaluate((ctx, [cookieName]) => {
				const storage = new ctx.default(cookieName);
				storage.remove('key1');
			}, [cookieName]);

			const
				cookieValue = await cookie.evaluate((ctx, [cookieName]) => ctx.get(cookieName), [cookieName]);

			test.expect(cookieValue).toBe('key2{{.}}val2');
		});
	});

	test.describe('`clear`', () => {
		test.beforeEach(async () => {
			await cookie.evaluate(
				(ctx, [cookieName, defaultStorage]) => ctx.set(cookieName, defaultStorage), [cookieName, defaultStorage]
			);
		});

		test('with clear filter', async () => {
			await cookieStorage.evaluate((ctx, [cookieName]) => {
				const storage = new ctx.default(cookieName);
				storage.clear((el) => el === 'val1');
			}, [cookieName]);

			const
				cookieValue = await cookie.evaluate((ctx, [cookieName]) => ctx.get(cookieName), [cookieName]);

			test.expect(cookieValue).toBe('key2{{.}}val2');
		});

		test('without clear filter', async () => {
			await cookieStorage.evaluate((ctx, [cookieName]) => {
				const storage = new ctx.default(cookieName);
				storage.clear();
			}, [cookieName]);

			const
				cookieValue = await cookie.evaluate((ctx, [cookieName]) => ctx.get(cookieName), [cookieName]);

			test.expect(cookieValue).toBe('');
		});
	});

	test.describe('`set`', () => {
		test('set works valid and set values to cookies', async () => {
			await cookieStorage.evaluate((ctx, [cookieName]) => {
				const storage = new ctx.default(cookieName);
				storage.set('key1', 'val1');
				storage.set('key2', 'val2');
			}, [cookieName]);

			const
				cookieValue = await cookie.evaluate((ctx, [cookieName]) => ctx.get(cookieName), [cookieName]);

			test.expect(cookieValue).toBe(defaultStorage);
		});
	});
});
