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
		context;

	describe('`iBlock.dom`', () => {
		beforeEach(async () => {
			context = await browser.newContext(contextOpts);

			page = await context.newPage();
			page.goto(initialUrl);

			dummyComponent = await h.component.waitForComponent(page, '.b-dummy');

			await dummyComponent.evaluate((ctx) => ctx.storage.set(1, 'testKey'));
		});

		afterEach(() => context.close());

		describe('`get`', () => {
			it('returns data by the provided key', async () => {
				const
					testVal = await dummyComponent.evaluate((ctx) => ctx.storage.get('testKey'));

				expect(testVal).toBe(1);
			});

			it('returns `undefined` if there is no data by the provided key', async () => {
				const
					testVal = await dummyComponent.evaluate((ctx) => ctx.storage.get('unreachableKey'));

				expect(testVal).toBeUndefined();
			});
		});

		describe('`set`', () => {
			it('saves the provided data', async () => {
				await dummyComponent.evaluate((ctx) => ctx.storage.set(1, 'newTestKey'));

				const
					testVal = await dummyComponent.evaluate((ctx) => ctx.storage.get('newTestKey'));

				expect(testVal).toBe(1);
			});
		});

		describe('`remove`', () => {
			it('removes data by the provided key', async () => {
				await dummyComponent.evaluate((ctx) => ctx.storage.remove('testKey'));

				const
					testVal = await dummyComponent.evaluate((ctx) => ctx.storage.get('testKey'));

				expect(testVal).toBeUndefined();
			});
		});
	});
};
