// @ts-check

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	h = include('tests/helpers');

/**
 * Starts a test
 *
 * @param {Playwright.Page} page
 * @param {object} params
 * @returns {void}
 */
module.exports = (page, {browser, contextOpts}) => {
	const initialUrl = page.url();

	let
		dummyComponent,
		cookie,
		context;

	describe('`core/cookies`', () => {
		beforeEach(async () => {
			context = await browser.newContext(contextOpts);

			page = await context.newPage();
			await page.goto(initialUrl);

			dummyComponent = await h.component.waitForComponent(page, '.b-dummy');
			cookie = await dummyComponent.evaluateHandle(({modules: {cookie}}) => cookie);
		});

		afterEach(() => context.close());

		describe('`get`', () => {
			beforeEach(async () => {
				await cookie.evaluate((ctx) => ctx.set('testCookie', 'testCookieVal'));
			});

			it('returns a cookie value', async () => {
				const
					testVal = await cookie.evaluate((ctx) => ctx.get('testCookie'));

				expect(testVal).toBe('testCookieVal');
			});

			it('returns `undefined` when trying to get a value of the non-existent cookie', async () => {
				const
					testVal = await cookie.evaluate((ctx) => ctx.get('unreachableCookie'));

				expect(testVal).toBeUndefined();
			});
		});

		describe('`has`', () => {
			beforeEach(async () => {
				await cookie.evaluate((ctx) => ctx.set('testCookie', 'testCookieVal'));
			});

			it('returns `true` if the cookie exists', async () => {
				const
					testVal = await cookie.evaluate((ctx) => ctx.has('testCookie'));

				expect(testVal).toBeTrue();
			});

			it('returns `false` if the cookie does not exist', async () => {
				const
					testVal = await cookie.evaluate((ctx) => ctx.has('unreachableCookie'));

				expect(testVal).toBeFalse();
			});
		});

		describe('`set`', () => {
			it('simple usage', async () => {
				await cookie.evaluate((ctx) => ctx.set('testCookie', 'testCookieVal'));

				const
					testVal = await page.evaluate(() => document.cookie);

				expect(testVal).toBe('testCookie=testCookieVal');
			});

			it('set multiply cookies', async () => {
				await cookie.evaluate((ctx) => ctx.set('testCookie', 'testCookieVal'));
				await cookie.evaluate((ctx) => ctx.set('testCookie2', 'testCookieVal2'));

				const
					cookies = await context.cookies(initialUrl);

				expect(cookies).toEqual([
					createCookie(),
					createCookie({
						name: 'testCookie2',
						value: 'testCookieVal2'
					})
				]);
			});

			it('with the `path` option provided', async () => {
				await cookie.evaluate((ctx) => ctx.set('testCookie', 'testCookieVal', {path: '/test'}));

				const
					origin = await page.evaluate(() => location.origin),
					cookies = await context.cookies(`${origin}/test`);

				expect(cookies).toEqual([createCookie({path: '/test'})]);
			});

			it('with the `expires` option provided', async () => {
				const expires = await page.evaluate(() => {
					globalThis._expDate = new Date(Date.now() + 86400e3);
					return Math.floor(globalThis._expDate.getTime() / 1000);
				});

				await cookie.evaluate((ctx) => ctx.set('testCookie', 'testCookieVal', {expires: globalThis._expDate}));

				const
					cookies = await context.cookies(initialUrl);

				expect(cookies).toEqual([createCookie({expires})]);
			});
		});

		describe('`remove`', () => {
			it('removes a cookie', async () => {
				await cookie.evaluate((ctx) => ctx.set('testCookie', 'testCookieVal'));
				await cookie.evaluate((ctx) => ctx.remove('testCookie'));

				const
					cookies = await context.cookies(initialUrl);

				expect(cookies).toEqual([]);
			});
		});

		function createCookie(params = {}) {
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
};
