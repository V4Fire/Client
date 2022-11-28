// @ts-check

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	h = include('tests/helpers').default;

/**
 * Starts a test
 *
 * @param {Playwright.Page} page
 * @param {!Object} params
 * @returns {Promise<void>}
 */
module.exports = async (page, params) => {
	await h.utils.setup(page, params.context);
	let root;

	beforeAll(async () => {
		root = await h.component.waitForComponent(page, '.p-v4-components-demo');
	});

	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('iStaticPage.pageMetaData', () => {
		describe('`pageTitle`', () => {
			it('simple usage', async () => {
				expect(
					await root.evaluate((ctx) => {
						ctx.pageTitle = 'Foo bar';
						return ctx.pageTitle;
					})
				).toBe('Foo bar');
			});

			it('should set `title` value', async () => {
				expect(
					await root.evaluate((ctx) => {
						ctx.pageTitle = 'Foo bar';
						return document.title;
					})
				).toBe('Foo bar');
			});

			it('`setPageTitle`', async () => {
				expect(
					await root.evaluate((ctx) => {
						ctx.pageTitle = '';
						return ctx.setPageTitle('Foo bar');
					})
				).toBeTrue();

				expect(await root.evaluate((ctx) => ctx.pageTitle)).toBe('Foo bar');
			});

			it('watching for changes', async () => {
				const scan = await root.evaluate(async (ctx) => {
					const res = [];

					ctx.pageTitle = '';
					ctx.watch('pageTitle', (val, oldVal) => {
						res.push([val, oldVal]);
					});

					ctx.pageTitle = 'Foo';
					await ctx.nextTick();

					ctx.pageTitle = 'Bar';
					await ctx.nextTick();

					return res;
				});

				expect(scan).toEqual([
					['Foo', undefined],
					['Bar', 'Foo']
				]);
			});
		});
	});
};
