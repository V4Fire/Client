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
		cookiesAPI: JSHandle<typeof CookiesAPI>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		cookiesAPI = await Utils.import(page, 'core/cookies');
	});

	test.describe('`get`', () => {
		test.beforeEach(async () => {
			await cookiesAPI.evaluate((cookies) => cookies.set('testCookie', 'testCookieVal'));
		});

		test('should return the value of a cookie by its name', async () => {
			const
				testVal = await cookiesAPI.evaluate((cookies) => cookies.get('testCookie'));

			test.expect(testVal).toBe('testCookieVal');
		});

		test('should return `undefined` when trying to get the value of a non-existent cookie', async () => {
			const
				testVal = await cookiesAPI.evaluate((cookies) => cookies.get('unreachableCookie'));

			test.expect(testVal).toBeUndefined();
		});
	});

	test.describe('`has`', () => {
		test.beforeEach(async () => {
			await cookiesAPI.evaluate((cookies) => cookies.set('testCookie', 'testCookieVal'));
		});

		test('should return true if the cookie exists', async () => {
			const
				testVal = await cookiesAPI.evaluate((cookies) => cookies.has('testCookie'));

			test.expect(testVal).toBe(true);
		});

		test('should return false if the cookie does not exist', async () => {
			const
				testVal = await cookiesAPI.evaluate((cookies) => cookies.has('unreachableCookie'));

			test.expect(testVal).toBe(false);
		});
	});

	test.describe('`set`', () => {
		test('simple usage', async ({page}) => {
			await cookiesAPI.evaluate((cookies) => cookies.set('testCookie', 'testCookieVal'));

			const
				testVal = await page.evaluate(() => document.cookie);

			test.expect(testVal.includes('testCookie=testCookieVal')).toBeTruthy();
		});

		test('should set multiply cookies', async ({context, page}) => {
			const
				cookieNames = ['testCookie', 'testCookie2'];

			await cookiesAPI.evaluate((cookies, cookieNames) => cookies.set(cookieNames[0], 'testCookieVal'), cookieNames);
			await cookiesAPI.evaluate((cookies, cookieNames) => cookies.set(cookieNames[1], 'testCookieVal2'), cookieNames);

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
			await cookiesAPI.evaluate((cookies) => cookies.set('testCookie', 'testCookieVal', {path: '/test'}));

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

			await cookiesAPI.evaluate((cookies) => cookies.set('testCookie', 'testCookieVal', {expires: globalThis._expDate}));

			const
				cookies = await context.cookies(page.url());

			test.expect(cookies.filter((el) => el.name === 'testCookie')).toEqual([createCookie({expires})]);
		});
	});

	test.describe('`remove`', () => {
		test('should remove a cookie', async ({context, page}) => {
			await cookiesAPI.evaluate((cookies) => cookies.set('testCookie', 'testCookieVal'));

			const
				cookies = await context.cookies(page.url());

			test.expect(cookies.find((el) => el.name === 'testCookie')).toBeTruthy();

			await cookiesAPI.evaluate((cookies) => cookies.remove('testCookie'));

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
