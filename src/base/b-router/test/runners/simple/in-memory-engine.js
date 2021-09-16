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
	describe('b-router simple usage with the in-memory engine', () => {
		generateSimpleUsageCommonSpecs(page, 'inMemoryRouterEngine');

		describe('in-memory engine specific', () => {
			let
				root;

			beforeEach(async () => {
				root = await initRouter(page, 'inMemoryRouterEngine');
			});

			it('checking the `route` property with `initialRoute`', async () => {
				expect(await root.evaluate(({route}) => route != null)).toBeTrue();
			});

			it('checking the `route` property without `initialRoute`', async () => {
				root = await initRouter(page, 'inMemoryRouterEngine', {initialRoute: null});
				expect(await root.evaluate(({route}) => route == null)).toBeTrue();
			});

			it('`replace` a page by a path', async () => {
				expect(await root.evaluate(async (ctx) => {
					const
						{router} = ctx,
						historyLength = router.engine.history.length,
						res = {};

					await router.replace('second');

					res.content = ctx.route.meta.content;
					res.lengthDoesntChange = historyLength === router.engine.history.length;

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
						historyLength = router.engine.history.length,
						res = {};

					await router.replace('second');
					await router.replace(null, {query: {bla: 1}});

					res.content = ctx.route.meta.content;
					res.lengthDoesntChange = historyLength === router.engine.history.length;

					return res;

				})).toEqual({
					content: 'Second page',
					lengthDoesntChange: true
				});
			});
		});
	});
};
