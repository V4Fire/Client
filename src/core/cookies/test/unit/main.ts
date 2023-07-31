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

import type * as Cookies from 'core/cookies';

test.describe('core/cookies', () => {
	let
		cookie: JSHandle<typeof Cookies>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		cookie = await Utils.import(page, 'core/cookies');
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

			test.expect(testVal.includes('testCookie=testCookieVal')).toBeTruthy();
		});

		test('set multiply cookies', async ({context, page}) => {
			const
				cookieNames = ['testCookie', 'testCookie2'];

			await cookie.evaluate((ctx, cookieNames) => ctx.set(cookieNames[0], 'testCookieVal'), cookieNames);
			await cookie.evaluate((ctx, cookieNames) => ctx.set(cookieNames[1], 'testCookieVal2'), cookieNames);

			const
				cookies = await context.cookies(page.url()),
				targetCookies = cookies.filter((el) => cookieNames.includes(el.name));

			test.expect(targetCookies).toEqual([
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

			test.expect(cookies.filter((el) => el.name === 'testCookie')).toEqual([createCookie({path: '/test'})]);
		});

		test('with the `expires` option provided', async ({page, context}) => {
			const expires = await page.evaluate(() => {
				globalThis._expDate = new Date(Date.now() + 86400e3);
				return Math.floor(globalThis._expDate.getTime() / 1000);
			});

			await cookie.evaluate((ctx) => ctx.set('testCookie', 'testCookieVal', {expires: globalThis._expDate}));

			const
				cookies = await context.cookies(page.url());

			test.expect(cookies.filter((el) => el.name === 'testCookie')).toEqual([createCookie({expires})]);
		});
	});

	test.describe('`remove`', () => {
		test('removes a cookie', async ({context, page}) => {
			await cookie.evaluate((ctx) => ctx.set('testCookie', 'testCookieVal'));

			const
				cookies = await context.cookies(page.url());

			test.expect(cookies.find((el) => el.name === 'testCookie')).toBeTruthy();

			await cookie.evaluate((ctx) => ctx.remove('testCookie'));

			const
				cookiesAfterRemove = await context.cookies(page.url());

			test.expect(cookiesAfterRemove.find((el) => el.name === 'testCookie')).toBeFalsy();
			test.expect(cookiesAfterRemove.length).toBe(cookies.length - 1);
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
