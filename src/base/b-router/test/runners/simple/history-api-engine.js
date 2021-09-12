// @ts-check

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @typedef {import('playwright').Page} Page
 */

const
	{initRouter, generateSimpleUsageCommonSpecs} = include('src/base/b-router/test/helpers');

/**
 * @param {Page} page
 */
module.exports = (page) => {
	describe('b-router simple usage with history API engine', () => {
		generateSimpleUsageCommonSpecs(page, 'historyApiRouterEngine');

		describe('history API engine specific', () => {
			let
				root;

			beforeEach(async () => {
				root = await initRouter(page, 'historyApiRouterEngine');
			});

			it('checking the `route` property', async () => {
				expect(await root.evaluate(({route}) => route != null)).toBeTrue();
			});

			it('`replace` a page by a path', async () => {
				expect(await root.evaluate(async (ctx) => {
					const
						historyLength = history.length,
						res = {};

					await ctx.router.replace('second');

					res.content = ctx.route.meta.content;
					res.lengthDoesntChange = historyLength === history.length;

					return res;

				})).toEqual({
					content: 'Second page',
					lengthDoesntChange: true
				});
			});

			it('`replace` a page by null', async () => {
				expect(await root.evaluate(async (ctx) => {
					const
						{router} = ctx;

					await router.replace('/');

					const
						historyLength = history.length,
						res = {};

					await router.replace('second');
					await router.replace(null, {query: {bla: 1}});

					res.content = ctx.route.meta.content;
					res.query = location.search;
					res.lengthDoesntChange = historyLength === history.length;

					return res;

				})).toEqual({
					query: '?bla=1',
					content: 'Second page',
					lengthDoesntChange: true
				});
			});
		});
	});
};
