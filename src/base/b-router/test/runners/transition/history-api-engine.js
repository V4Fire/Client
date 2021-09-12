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
	{initRouter, generateTransitionCommonSpecs} = include('src/base/b-router/test/helpers');

/**
 * @param {Page} page
 */
module.exports = (page) => {
	describe('b-router advanced transitions with history API engine', () => {
		generateTransitionCommonSpecs(page, 'historyApiRouterEngine');

		describe('history API engine specific', () => {
			let
				root;

			beforeEach(async () => {
				root = await initRouter(page, 'historyApiRouterEngine');
			});

			it('transition to a route with the path interpolation', async () => {
				expect(await root.evaluate(async (ctx) => {
					const
						{router} = ctx;

					const
						result = {},
						s = () => location.pathname + location.search;

					await router.push('template', {params: {param1: 'foo'}});
					result.path1 = s();

					await router.push('template', {params: {param1: 'foo'}, query: {param2: 109}});
					result.path2 = s();

					await router.push('/strict-tpl/:param1', {params: {param1: 'foo'}, query: {param2: 109}});
					result.path3 = s();

					return result;

				})).toEqual({
					path1: '/tpl/foo',
					path2: '/tpl/foo/109',
					path3: '/strict-tpl/foo?param2=109'
				});
			});
		});
	});
};
