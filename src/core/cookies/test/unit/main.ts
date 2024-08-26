/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Cookie } from 'playwright';

import test from 'tests/config/unit/test';
import Utils from 'tests/helpers/utils';

import type * as CookiesAPI from 'core/cookies';

test.describe('core/cookies', () => {
	let
		api: JSHandle<typeof CookiesAPI>,
		cookiesAPI: JSHandle<CookiesAPI.Cookies>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		api = await Utils.import(page, 'core/cookies');
		cookiesAPI = await api.evaluateHandle((ctx) => ctx.from(document));
	});

	test.describe('`get`', () => {
		test.beforeEach(async () => {
			await cookiesAPI.evaluate((cookies) => cookies.set('testCookie', 'testCookieVal'));
		});

		test('should return the value of a cookie by its name', async () => {
			const res = await cookiesAPI.evaluate(
				(cookies) => cookies.get('testCookie')
			);

			test.expect(res).toBe('testCookieVal');
		});

		test('should return `undefined` when trying to get the value of a non-existent cookie', async () => {
			const res = await cookiesAPI.evaluate(
				(cookies) => cookies.get('unreachableCookie')
			);

			test.expect(res).toBeUndefined();
		});
	});

	test.describe('`has`', () => {
		test.beforeEach(async () => {
			await cookiesAPI.evaluate((cookies) => cookies.set('testCookie', 'testCookieVal'));
		});

		test('should return true if the cookie exists', async () => {
			const res = await cookiesAPI.evaluate(
				(cookies) => cookies.has('testCookie')
			);

			test.expect(res).toBe(true);
		});

		test('should return false if the cookie does not exist', async () => {
			const res = await cookiesAPI.evaluate(
				(cookies) => cookies.has('unreachableCookie')
			);

			test.expect(res).toBe(false);
		});
	});

	test.describe('`set`', () => {
		test('simple usage', async () => {
			await cookiesAPI.evaluate((cookies) => cookies.set('testCookie', 'testCookieVal'));

			const res = await cookiesAPI.evaluate(
				(cookies) => cookies.store.cookie
			);

			test.expect(res.includes('testCookie=testCookieVal')).toBe(true);
		});

		test('should set multiply cookies', async () => {
			await cookiesAPI.evaluate((cookies) => {
				cookies.set('testCookie', 'testCookieVal');
				cookies.set('testCookie2', 'testCookieVal2');
			});

			const res = await cookiesAPI.evaluate(
				(cookies) => cookies.store.cookie
			);

			test.expect(res.includes('testCookie=testCookieVal; testCookie2=testCookieVal2')).toBe(true);
		});

		test('with the `path` option provided', async ({page, context}) => {
			await cookiesAPI.evaluate(
				(cookies) => cookies.set('testCookie', 'testCookieVal', {path: '/test'})
			);

			const
				origin = await page.evaluate(() => location.origin),
				cookies = await context.cookies(`${origin}/test`);

			test.expect(cookies.filter((el) => el.name === 'testCookie')).toEqual([resolveCookieParams({path: '/test'})]);
		});

		test('with the `expires` option provided', async ({page, context}) => {
			const expires = await page.evaluate(() => {
				globalThis._expDate = new Date(Date.now() + 86400e3);
				return Math.floor(globalThis._expDate.getTime() / 1000);
			});

			await cookiesAPI.evaluate(
				(cookies) => cookies.set('testCookie', 'testCookieVal', {expires: globalThis._expDate})
			);

			const cookies = await context.cookies(page.url());
			test.expect(cookies.filter((el) => el.name === 'testCookie')).toEqual([resolveCookieParams({expires})]);
		});

		test('with the `maxAge` option provided', async () => {
			await cookiesAPI.evaluate(
				(cookies) => cookies.set('testCookie', 'testCookieVal', {maxAge: 10})
			);

			const res1 = await cookiesAPI.evaluate(
				(cookies) => cookies.store.cookie
			);

			test.expect(res1.includes('testCookie=testCookieVal')).toBe(true);

			await cookiesAPI.evaluate(
				(cookies) => cookies.set('testCookie', 'testCookieVal', {maxAge: 0})
			);

			const res2 = await cookiesAPI.evaluate(
				(cookies) => cookies.store.cookie
			);

			test.expect(res2.includes('testCookie=testCookieVal')).toBe(false);
		});
	});

	test.describe('`remove`', () => {
		test('should remove a cookie', async () => {
			const res = await cookiesAPI.evaluate((cookies) => {
				cookies.set('testCookie', 'testCookieVal');
				cookies.remove('testCookie');
				return cookies.store.cookie;
			});

			test.expect(res.includes('testCookie=testCookieVal')).toBe(false);
		});
	});

	test.describe('with `withIdempotency` decorator', () => {
		let idempotentCookiesAPI;

		test.beforeEach(async () => {
			idempotentCookiesAPI = await api.evaluateHandle((ctx) => {
				const store = ctx.withIdempotency(document);

				return ctx.from(store);
			});
		});

		test.describe('should not change current cookie', () => {
			test('cookie has value', async () => {
				const res = await idempotentCookiesAPI.evaluate((cookies) => {
					cookies.set('testCookie', 'testCookieVal', {maxAge: 10});
					cookies.set('testCookie', 'testCookieVal', {maxAge: 0});

					return cookies.store.cookie;
				});

				test.expect(res.includes('testCookie=testCookieVal')).toBe(true);
			});

			test('cookie has no value', async () => {
				const res = await idempotentCookiesAPI.evaluate((cookies) => {
					cookies.set('testCookie', {maxAge: 10});
					cookies.set('testCookie', {maxAge: 0});

					return cookies.store.cookie;
				});

				test.expect(res.includes('testCookie')).toBe(true);
			});
		});

		test.describe('should change current cookie', () => {
			test('cookie has value', async () => {
				const res = await idempotentCookiesAPI.evaluate((cookies) => {
					cookies.set('testCookie', 'testCookieVal1');
					cookies.set('testCookie', 'testCookieVal2');

					return cookies.store.cookie;
				});

				test.expect(res.includes('testCookie=testCookieVal1')).toBe(false);
				test.expect(res.includes('testCookie=testCookieVal2')).toBe(true);
			});

			test('cookie has no value', async () => {
				const res = await idempotentCookiesAPI.evaluate((cookies) => {
					cookies.set('testCookie1');
					cookies.set('testCookie2');

					return cookies.store.cookie;
				});

				test.expect(res.includes('testCookie1')).toBe(true);
				test.expect(res.includes('testCookie2')).toBe(true);
			});
		});
	});

	function resolveCookieParams(params: Dictionary = {}): Cookie {
		return {
			sameSite: 'Lax',
			name: 'testCookie',
			value: 'testCookieVal',
			domain: 'localhost',
			path: '/',
			expires: -1,
			httpOnly: false,
			secure: false,
			...params
		};
	}
});
