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
	{initRouter} = include('src/base/b-router/test/helpers');

/** @param {Page} page */
module.exports = (page) => {
	let
		root;

	describe('b-router simple using', () => {
		beforeEach(async () => {
			root = await initRouter(page);
		});

		it('checking the root', async () => {
			expect(await root.evaluate((ctx) => ctx.meta.params.root)).toBe(true);
		});

		it('checking the `route` property', async () => {
			expect(await root.evaluate(({route}) => route != null)).toBeTrue();
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
