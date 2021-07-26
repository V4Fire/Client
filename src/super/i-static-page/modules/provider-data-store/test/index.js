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
 * @param {!Object} params
 * @returns {Promise<void>}
 */
module.exports = async (page, params) => {
	await h.utils.setup(page, params.context);

	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('iStaticPage.providerDataStore', () => {
		it('checking data by a provider name', async () => {
			const target = await init({
				dataProvider: 'demo.List'
			});

			expect(
				await target.evaluate((ctx) => {
					const item = ctx.r.providerDataStore.get('demo.List');
					return Object.fastClone(item.select({where: {label: 'Foo'}}));
				})

			).toEqual({label: 'Foo', value: 'foo'});
		});

		it('checking data by a global name', async () => {
			const target = await init({
				globalName: 'foo',
				dataProvider: 'demo.List'
			});

			expect(
				await target.evaluate((ctx) => {
					const item = ctx.r.providerDataStore.get('foo');
					return Object.fastClone(item.select({where: {label: 'Foo'}}));
				})

			).toEqual({label: 'Foo', value: 'foo'});
		});

		async function init(attrs = {}) {
			await page.evaluate((attrs) => {
				globalThis.renderComponents('b-remote-provider', [
					{
						attrs: {
							id: 'target',
							...attrs
						}
					}
				]);
			}, attrs);

			await h.component.waitForComponentStatus(page, '#target', 'ready');
			return h.component.waitForComponent(page, '#target');
		}
	});
};
