/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Cookie } from 'playwright';

import type * as Cookies from 'core/cookies';

import test from 'tests/config/unit/test';

test.describe('core/cookies', () => {
	let
		cookie: JSHandle<typeof Cookies>;

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
		cookie = await (await demoPage.createDummy()).evaluateHandle(({modules: {cookie}}) => cookie);
	});

	test.describe('`get`', () => {
		test.beforeEach(async () => {
			await cookie.evaluate((ctx) => ctx.set('testCookie', 'testCookieVal'));
		});

		test('returns a cookie value', async () => {
			const
				testVal = await cookie.evaluate((ctx) => ctx.get('testCookie'));

			test.expect(testVal).toBe('testCookieVal');
		});

		test('returns `undefined` when trying to get a value of the non-existent cookie', async () => {
			const
				testVal = await cookie.evaluate((ctx) => ctx.get('unreachableCookie'));

			test.expect(testVal).toBeUndefined();
		});
	});

	test.describe('`has`', () => {
		test.beforeEach(async () => {
			await cookie.evaluate((ctx) => ctx.set('testCookie', 'testCookieVal'));
		});

		test('returns `true` if the cookie exists', async () => {
			const
				testVal = await cookie.evaluate((ctx) => ctx.has('testCookie'));

			test.expect(testVal).toBe(true);
		});

		test('returns `false` if the cookie does not exist', async () => {
			const
				testVal = await cookie.evaluate((ctx) => ctx.has('unreachableCookie'));

			test.expect(testVal).toBe(false);
		});
	});

	test.describe('`set`', () => {
		test('simple usage', async ({page}) => {
			await cookie.evaluate((ctx) => ctx.set('testCookie', 'testCookieVal'));

			const
				testVal = await page.evaluate(() => document.cookie);

			test.expect(testVal).toBe('testCookie=testCookieVal');
		});

		test('set multiply cookies', async ({context, page}) => {
			await cookie.evaluate((ctx) => ctx.set('testCookie', 'testCookieVal'));
			await cookie.evaluate((ctx) => ctx.set('testCookie2', 'testCookieVal2'));

			const
				cookies = await context.cookies(page.url());

			test.expect(cookies).toEqual([
				createCookie(),
				createCookie({
					name: 'testCookie2',
					value: 'testCookieVal2'
				})
			]);
		});

		test('with the `path` option provided', async ({page, context}) => {
			await cookie.evaluate((ctx) => ctx.set('testCookie', 'testCookieVal', {path: '/test'}));

			const
				origin = await page.evaluate(() => location.origin),
				cookies = await context.cookies(`${origin}/test`);

			test.expect(cookies).toEqual([createCookie({path: '/test'})]);
		});

		test('with the `expires` option provided', async ({page, context}) => {
			const expires = await page.evaluate(() => {
				globalThis._expDate = new Date(Date.now() + 86400e3);
				return Math.floor(globalThis._expDate.getTime() / 1000);
			});

			await cookie.evaluate((ctx) => ctx.set('testCookie', 'testCookieVal', {expires: globalThis._expDate}));

			const
				cookies = await context.cookies(page.url());

			test.expect(cookies).toEqual([createCookie({expires})]);
		});
	});

	test.describe('`remove`', () => {
		test('removes a cookie', async ({context, page}) => {
			await cookie.evaluate((ctx) => ctx.set('testCookie', 'testCookieVal'));
			await cookie.evaluate((ctx) => ctx.remove('testCookie'));

			const
				cookies = await context.cookies(page.url());

			test.expect(cookies).toEqual([]);
		});
	});

	function createCookie(params: Dictionary = {}): Cookie {
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
