/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Browser, BrowserContext } from 'playwright';

import test from 'tests/config/unit/test';
import Utils from 'tests/helpers/utils';

import type * as BrowserAPI from 'core/browser';

test.describe('core/browser', () => {
	let
		initialURL: string,
		context: BrowserContext;

	let
		browserApi: JSHandle<typeof BrowserAPI>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		initialURL = page.url();
	});

	test.afterEach(() => context.close());

	const UaList = {
		android10: 'Mozilla/5.0 (Linux; arm_64; Android 10; MI 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 YaBrowser/21.3.1.128.00 SA/3 Mobile Safari/537.36',
		iphone14: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/71.0.3578.89 Mobile/15E148 Safari/605.1',
		chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 YaBrowser/21.6.0.616 Yowser/2.5 Safari/537.36',
		chromeMac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.141 YaBrowser/22.3.3.865 Yowser/2.5 Safari/537.36',
		safariMac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.3 Safari/605.1.15'
	};

	test.describe('`test`', () => {
		test.describe('should return `true`', () => {
			test('for the Android platform', async ({browser}) => {
				await createPageWithUserAgent(browser, UaList.android10);

				const
					res = await browserApi.evaluate((ctx) => ctx.test('Android'));

				test.expect(res).toBe(true);
			});

			test('for the iOS platform', async ({browser}) => {
				await createPageWithUserAgent(browser, UaList.iphone14);

				const
					res = await browserApi.evaluate((ctx) => ctx.test('iOS'));

				test.expect(res).toBe(true);
			});

			test('for the Chrome platform', async ({browser}) => {
				await createPageWithUserAgent(browser, UaList.chrome);

				const
					res = await browserApi.evaluate((ctx) => ctx.test('Chrome'));

				test.expect(res).toBe(true);
			});

			test('for the ChromeMac platform', async ({browser}) => {
				await createPageWithUserAgent(browser, UaList.chromeMac);

				const
					res = await browserApi.evaluate((ctx) => ctx.test('Chrome'));

				test.expect(res).toBe(true);
			});

			test('for the Safari platform', async ({browser}) => {
				await createPageWithUserAgent(browser, UaList.safariMac);

				const
					res = await browserApi.evaluate((ctx) => ctx.test('Safari'));

				test.expect(res).toBe(true);
			});

			test('for the Android platform a version greater than 8.0.0', async ({browser}) => {
				await createPageWithUserAgent(browser, UaList.android10);

				const
					res = await browserApi.evaluate((ctx) => ctx.test('Android', '>', '8.0.0'));

				test.expect(res).toBe(true);
			});

			test('`for the Android platform with a version greater than 9.0.0', async ({browser}) => {
				await createPageWithUserAgent(browser, UaList.android10);

				const
					res = await browserApi.evaluate((ctx) => ctx.test('Android', '>', '9.0.0'));

				test.expect(res).toBe(true);
			});

			test('`for the Safari platform with a version greater than 13', async ({browser}) => {
				await createPageWithUserAgent(browser, UaList.safariMac);

				const
					res = await browserApi.evaluate((ctx) => ctx.test('Safari', '>', '13'));

				test.expect(res).toBe(true);
			});
		});

		test.describe('should return `false`', () => {
			test('for the Android platform', async ({browser}) => {
				await createPageWithUserAgent(browser, UaList.iphone14);

				const
					res = await browserApi.evaluate((ctx) => ctx.test('Android'));

				test.expect(res).toBe(false);
			});

			test('for the iOS platform', async ({browser}) => {
				await createPageWithUserAgent(browser, UaList.chrome);

				const
					res = await browserApi.evaluate((ctx) => ctx.test('iOS'));

				test.expect(res).toBe(false);
			});

			test('for the Chrome platform', async ({browser}) => {
				await createPageWithUserAgent(browser, UaList.iphone14);

				const
					res = await browserApi.evaluate((ctx) => ctx.test('Chrome'));

				test.expect(res).toBe(false);
			});

			test('for the ChromeMac platform', async ({browser}) => {
				await createPageWithUserAgent(browser, UaList.chromeMac);

				const
					res = await browserApi.evaluate((ctx) => ctx.test('Safari'));

				test.expect(res).toBe(false);
			});

			test('for the safariMac platform', async ({browser}) => {
				await createPageWithUserAgent(browser, UaList.safariMac);

				const
					res = await browserApi.evaluate((ctx) => ctx.test('Chrome'));

				test.expect(res).toBe(false);
			});

			test('`for the Safari platform with a version less than 13', async ({browser}) => {
				await createPageWithUserAgent(browser, UaList.safariMac);

				const
					res = await browserApi.evaluate((ctx) => ctx.test('Safari', '<', '13'));

				test.expect(res).toBe(false);
			});

			test('`for the Android platform a version less than 8.0.0', async ({browser}) => {
				await createPageWithUserAgent(browser, UaList.android10);

				const
					res = await browserApi.evaluate((ctx) => ctx.test('Android', '<', '8.0.0'));

				test.expect(res).toBe(false);
			});

			test('`for the Android platform with a version greater than 12.0.0', async ({browser}) => {
				await createPageWithUserAgent(browser, UaList.android10);

				const
					res = await browserApi.evaluate((ctx) => ctx.test('Android', '>', '12.0.0'));

				test.expect(res).toBe(false);
			});
		});
	});

	async function createPageWithUserAgent(browser: Browser, userAgent: string) {
		context = await browser.newContext({userAgent});

		const page = await context.newPage();
		await page.goto(initialURL);

		browserApi = await Utils.import(page, 'core/browser');
	}
});
