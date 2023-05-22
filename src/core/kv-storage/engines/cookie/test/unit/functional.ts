/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';

import type * as Cookies from 'core/cookies';
import type * as CookieStorageEngines from 'core/kv-storage/engines/cookie';

import test from 'tests/config/unit/test';
import Utils from 'tests/helpers/utils';

test.describe('core/kv-storage/engines/cookie', () => {
	let
		cookies: JSHandle<typeof Cookies>,
		cookieStorage: JSHandle<typeof CookieStorageEngines>;

	const
		cookieName = 'v4ls',
		fixture = 'key1{{.}}val1{{#}}key2{{.}}val2';

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		cookies = await Utils.import(page, 'core/cookies');
		cookieStorage = await Utils.import(page, 'core/kv-storage/engines/cookie');
	});

	test.beforeEach(async () => {
		await cookies.evaluate((ctx, [cookieName]) => ctx.remove(cookieName), [cookieName]);
	});

	test.describe('`has`', () => {
		test.beforeEach(async () => {
			await cookies.evaluate((cookies, [name, data]) => cookies.set(name, data), [cookieName, fixture]);
		});

		test('should return true if the value by key exists in the cookie', async () => {
			const res = await cookieStorage.evaluate(({syncLocalStorage}) => syncLocalStorage.has('key1'));
			test.expect(res).toBe(true);
		});

		test('should return false if the value by key does not exist in the cookie', async () => {
			const res = await cookieStorage.evaluate(({syncLocalStorage}) => syncLocalStorage.has('foo'));
			test.expect(res).toBe(false);
		});
	});

	test.describe('`get`', () => {
		test.beforeEach(async () => {
			await cookies.evaluate((cookies, [name, data]) => cookies.set(name, data), [cookieName, fixture]);
		});

		test('should return value from cookie by key', async () => {
			const res = await cookieStorage.evaluate(({syncLocalStorage}) => syncLocalStorage.get('key1'));
			test.expect(res).toBe('val1');
		});

		test('should return undefined for a key that is not in the cookie', async () => {
			const res = await cookieStorage.evaluate(({syncLocalStorage}) => syncLocalStorage.get('foo'));
			test.expect(res).toBeUndefined();
		});
	});

	test.describe('`set`', () => {
		test('should set cookie values by given keys', async () => {
			await cookieStorage.evaluate(({syncLocalStorage}) => {
				syncLocalStorage.set('key1', 'val1');
				syncLocalStorage.set('key2', 'val2');
			});

			const
				cookieValue = await cookies.evaluate((ctx, [name]) => ctx.get(name), [cookieName]);

			test.expect(cookieValue).toBe('key1{{.}}val1{{#}}key2{{.}}val2');
		});
	});

	test.describe('`remove`', () => {
		test.beforeEach(async () => {
			await cookies.evaluate((ctx, [name, data]) => ctx.set(name, data), [cookieName, fixture]);
		});

		test('should remove value from cookie by key', async () => {
			await cookieStorage.evaluate(({syncLocalStorage}) => syncLocalStorage.remove('key1'));

			const
				cookieValue = await cookies.evaluate((ctx, [name]) => ctx.get(name), [cookieName]);

			test.expect(cookieValue).toBe('key2{{.}}val2');
		});
	});

	test.describe('`clear`', () => {
		test.beforeEach(async () => {
			await cookies.evaluate((ctx, [name, data]) => ctx.set(name, data), [cookieName, fixture]);
		});

		test('should clear all values', async () => {
			await cookieStorage.evaluate(({syncLocalStorage}) => syncLocalStorage.clear());

			const
				cookieValue = await cookies.evaluate((ctx, [name]) => ctx.get(name), [cookieName]);

			test.expect(cookieValue).toBe('');
		});

		test('should clear only those values that match the predicate', async () => {
			await cookieStorage.evaluate(({syncLocalStorage}) => syncLocalStorage.clear((el) => el === 'val1'));

			const
				cookieValue = await cookies.evaluate((ctx, [name]) => ctx.get(name), [cookieName]);

			test.expect(cookieValue).toBe('key2{{.}}val2');
		});
	});
});
