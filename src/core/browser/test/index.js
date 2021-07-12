/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

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
		browserApi,
		context;

	const UaList = {
		android10: 'Mozilla/5.0 (Linux; arm_64; Android 10; MI 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 YaBrowser/21.3.1.128.00 SA/3 Mobile Safari/537.36',
		iphone14: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/71.0.3578.89 Mobile/15E148 Safari/605.1',
		chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 YaBrowser/21.6.0.616 Yowser/2.5 Safari/537.36'
	};

	describe('`core/browser`', () => {
		afterEach(() => context.close());

		describe('`test`', () => {
			describe('returns `true`', () => {
				it('`platform: Android`', async () => {
					await createContextWithOpts({
						userAgent: UaList.android10
					});

					const
						testVal = await browserApi.evaluate((ctx) => ctx.test('Android'));

					expect(testVal).toBeTrue();
				});

				it('`platform: iOS`', async () => {
					await createContextWithOpts({
						userAgent: UaList.iphone14
					});

					const
						testVal = await browserApi.evaluate((ctx) => ctx.test('iOS'));

					expect(testVal).toBeTrue();
				});

				it('`platform: Chrome`', async () => {
					await createContextWithOpts({
						userAgent: UaList.chrome
					});

					const
						testVal = await browserApi.evaluate((ctx) => ctx.test('Chrome'));

					expect(testVal).toBeTrue();
				});

				it('`platform: Android`, `operation: >`', async () => {
					await createContextWithOpts({
						userAgent: UaList.android10
					});

					const
						testVal = await browserApi.evaluate((ctx) => ctx.test('Android', '>'));

					expect(testVal).toBeTrue();
				});

				it('`platform: Android`, `operation: >`, `version: 9.0.0`', async () => {
					await createContextWithOpts({
						userAgent: UaList.android10
					});

					const
						testVal = await browserApi.evaluate((ctx) => ctx.test('Android', '>', '9.0.0'));

					expect(testVal).toBeTrue();
				});
			});

			describe('returns `false`', () => {
				it('`platform: Android`', async () => {
					await createContextWithOpts({
						userAgent: UaList.iphone14
					});

					const
						testVal = await browserApi.evaluate((ctx) => ctx.test('Android'));

					expect(testVal).toBeFalse();
				});

				it('`platform: iOS`', async () => {
					await createContextWithOpts({
						userAgent: UaList.Chrome
					});

					const
						testVal = await browserApi.evaluate((ctx) => ctx.test('iOS'));

					expect(testVal).toBeFalse();
				});

				it('`platform: Chrome`', async () => {
					await createContextWithOpts({
						userAgent: UaList.iphone14
					});

					const
						testVal = await browserApi.evaluate((ctx) => ctx.test('Chrome'));

					expect(testVal).toBeFalse();
				});

				it('`platform: Android`, `operation: <`', async () => {
					await createContextWithOpts({
						userAgent: UaList.android10
					});

					const
						testVal = await browserApi.evaluate((ctx) => ctx.test('Android', '<', '8.0.0'));

					expect(testVal).toBeFalse();
				});

				it('`platform: Android`, `operation: >`, `version: 12.0.0`', async () => {
					await createContextWithOpts({
						userAgent: UaList.android10
					});

					const
						testVal = await browserApi.evaluate((ctx) => ctx.test('Android', '>', '12.0.0'));

					expect(testVal).toBeFalse();
				});
			});
		});
	});

	async function createContextWithOpts(opts = {}) {
		context = await browser.newContext({...contextOpts, ...opts});
		page = await context.newPage();

		await page.goto(initialUrl);

		dummyComponent = await h.component.waitForComponent(page, '.b-dummy');
		browserApi = await dummyComponent.evaluateHandle(({modules: {browserHelpers}}) => browserHelpers);
	}
};
