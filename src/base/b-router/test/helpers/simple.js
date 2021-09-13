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

/**
 * Generates common specs for all router engines of "simple usage" runners
 *
 * @param {Page} page
 * @param {'historyApiRouterEngine'|'inMemoryRouterEngine'} engineName
 */
module.exports = function generateSimpleUsageCommonSpecs(page, engineName) {
	describe('common', () => {
		let
			root;

		beforeEach(async () => {
			root = await initRouter(page, engineName);
		});

		it('checking the root', async () => {
			expect(await root.evaluate((ctx) => ctx.meta.params.root)).toBe(true);
		});

		it('checking the `router` property', async () => {
			expect(await root.evaluate(({router}) => router.componentName)).toBe('b-router');
		});

		it('`push` a page by a route identifier', async () => {
			expect(await root.evaluate(async (ctx) => {
				await ctx.router.push('second');
				return ctx.route.meta.content;
			})).toBe('Second page');
		});

		it('`push` a page by a path', async () => {
			expect(await root.evaluate(async (ctx) => {
				await ctx.router.push('/');
				return ctx.route.meta.content;
			})).toBe('Main page');
		});

		it('checking the `activePage` property', async () => {
			expect(await root.evaluate(async (ctx) => {
				await ctx.router.push('second');
				return ctx.activePage;
			})).toBe('second');

			expect(await root.evaluate(async (ctx) => {
				await ctx.router.push('main');
				return ctx.activePage;
			})).toBe('main');
		});

		it('updating of routes', async () => {
			expect(await root.evaluate(async (ctx) => {
				const
					{router} = ctx;

				const
					res = {},
					oldRoutes = ctx.router.routes;

				await router.updateRoutes({
					main: {
						path: '/',
						default: true,
						content: 'Dynamic main page'
					}
				});

				res.dynamicPage = ctx.route.meta.content;

				router.routes = oldRoutes;
				router.routeStore = undefined;

				await router.initRoute('main');
				res.restoredPage = ctx.route.meta.content;

				return res;

			})).toEqual({
				dynamicPage: 'Dynamic main page',
				restoredPage: 'Main page'
			});
		});

		it('updating of a base path', async () => {
			expect(await root.evaluate(async (ctx) => {
				const
					{router} = ctx;

				const
					res = {},
					oldRoutes = ctx.router.routes;

				await router.updateRoutes('/demo', '/demo/second', {
					main: {
						path: '/',
						default: true,
						content: 'Dynamic main page'
					},

					second: {
						path: '/second',
						default: true,
						content: 'Dynamic second page'
					}
				});

				res.dynamicPage = ctx.route.meta.content;

				router.basePath = '/';
				router.routes = oldRoutes;
				router.routeStore = undefined;

				await router.initRoute('/');
				res.restoredPage = ctx.route.meta.content;

				return res;

			})).toEqual({
				dynamicPage: 'Dynamic second page',
				restoredPage: 'Main page'
			});
		});

		it('getting URL by a query', async () => {
			expect(await root.evaluate(({router}) => router.getRoutePath('second', {query: {bla: 1}})))
				.toBe('/second?bla=1');

			expect(await root.evaluate(({router}) => router.getRoutePath('/', {query: {bla: 1}})))
				.toBe('/?bla=1');
		});

		it('getting route parameters by a query', async () => {
			const pageMeta = {
				name: 'main',
				page: 'main',
				path: '/',
				default: false,
				external: false,
				content: 'Main page'
			};

			expect(await root.evaluate(({router}) => {
				const route = router.getRoute('main');
				return route.meta;
			})).toEqual(pageMeta);

			expect(await root.evaluate(({router}) => {
				const route = router.getRoute('/');
				return route.meta;
			})).toEqual(pageMeta);
		});
	});
};
