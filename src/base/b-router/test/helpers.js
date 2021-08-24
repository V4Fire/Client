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
	h = include('tests/helpers');

/**
 * Initializes a router
 *
 * @param {Page} page
 * @param {'historyApiRouterEngine'|'inMemoryRouterEngine'} engineName
 * @param {string|undefined|null} [initialRoute]- Pass `null` to remove initialRoute for the in-memory engine
 *
 * @returns {!Promise<Playwright.JSHandle>}
 */
async function initRouter(page, engineName, initialRoute) {
	await (await h.component.getRoot(page)).evaluate((ctx) => ctx.router?.clear());

	if (initialRoute === undefined && engineName === 'inMemoryRouterEngine') {
		initialRoute = 'main';
	}

	await page.evaluate(([engineName, initialRoute]) => {
		globalThis.removeCreatedComponents();

		const
			bDummyComponent = document.querySelector('.b-dummy').component,
			engine = bDummyComponent.engines.router[engineName];

		const scheme = [
			{
				attrs: {
					id: 'target',

					engine,
					initialRoute: initialRoute ?? undefined,

					routes: {
						main: {
							path: '/',
							content: 'Main page'
						},

						second: {
							path: '/second',
							content: 'Second page',
							query: {
								rootParam: (o) => o.r.rootParam
							}
						},

						secondAlias: {
							path: '/second/alias',
							alias: 'second'
						},

						aliasToAlias: {
							path: '/alias-to-alias',
							alias: 'secondAlias'
						},

						aliasToRedirect: {
							path: '/second/alias-redirect',
							alias: 'indexRedirect'
						},

						indexRedirect: {
							path: '/redirect',
							redirect: 'main'
						},

						secondRedirect: {
							path: '/second/redirect',
							redirect: 'second'
						},

						redirectToAlias: {
							path: '/redirect-alias',
							redirect: 'secondAlias'
						},

						redirectToRedirect: {
							path: '/redirect-redirect',
							redirect: 'secondRedirect'
						},

						external: {
							path: 'https://www.google.com'
						},

						externalRedirect: {
							path: '/external-redirect',
							redirect: 'https://www.google.com'
						},

						localExternal: {
							path: '/',
							external: true
						},

						template: {
							path: '/tpl/:param1/:param2?'
						},

						strictTemplate: {
							paramsFromQuery: false,
							path: '/strict-tpl/:param1/:param2?'
						},

						templateAlias: {
							path: '/tpl-alias/:param1/:param2?',
							alias: 'template'
						},

						notFound: {
							default: true,
							content: '404'
						}
					}
				}
			}
		];

		globalThis.renderComponents('b-router', scheme);
	}, [engineName, initialRoute]);

	await h.component.waitForComponent(page, '#target');
	return h.component.getRoot(page);
}

/**
 * Generates common specs for all router engines of "simple usage" runners
 *
 * @param {Page} page
 * @param {'historyApiRouterEngine'|'inMemoryRouterEngine'} engineName
 */
function generateSimpleUsageCommonSpecs(page, engineName) {
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
}

/**
 * Generates common specs for all router engines of "watch" runners
 *
 * @param {Page} page
 * @param {'historyApiRouterEngine'|'inMemoryRouterEngine'} engineName
 */
function generateWatchCommonSpecs(page, engineName) {
	describe('common', () => {
		let
			root;

		beforeEach(async () => {
			root = await initRouter(page, engineName);
		});

		it('watching for `route` changes', async () => {
			expect(await root.evaluate(async (ctx, engineName) => {
				const
					{router} = ctx;

				const
					result = {routeChanges: [], queryChanges: []};

				await router.push('/second');
				await router.push('/');

				if (engineName === 'historyApiRouterEngine') {
					result.initialQuery = location.search;
				}

				result.initialContent = ctx.route.meta.content;

				const
					group = {group: Math.random().toString()};

				ctx.watch('route', group, (val, old) => {
					result.routeChanges.push([
						Object.fastClone(val.query),
						Object.fastClone(old?.query)
					]);
				}, group);

				ctx.watch('route.query', {deep: true, withProto: true, collapse: false, ...group}, (val, old) => {
					result.queryChanges.push([Object.fastClone(val), Object.fastClone(old)]);
				}, group);

				await router.push('second', {query: {foo: 1}});
				await router.push('second', {query: {foo: 2}});
				ctx.async.terminateWorker(group);

				await router.push('second', {query: {foo: 3}});
				return result;

			}, engineName)).toEqual(
				engineName === 'historyApiRouterEngine' ?
					{
						initialContent: 'Main page',
						initialQuery: '',
						routeChanges: [[{foo: 1}, undefined]],
						queryChanges: [[{foo: 1}, undefined], [{foo: 2}, {foo: 1}]]
					} :
					{
						initialContent: 'Main page',
						routeChanges: [[{foo: 1}, undefined]],
						queryChanges: [[{foo: 1}, undefined], [{foo: 2}, {foo: 1}]]
					}
				);
		});

		it('linking for the `route` property', async () => {
			expect(await root.evaluate(async (ctx, engineName) => {
				const
					{router} = ctx;

				const
					result = {};

				await router.push('/second');
				await router.push('/');

				if (engineName === 'historyApiRouterEngine') {
					result.initialQuery = location.search;
				}

				result.initialContent = ctx.route.meta.content;

				const
					group = {group: Math.random().toString()},
					watchOpts = {deep: true, withProto: true, collapse: false, ...group};

				result.initialRouteLink =
					ctx.sync.link(['routeLink', 'route.query'], watchOpts, (query) => Object.fastClone(query));

				await router.push('second', {query: {foo: 1}});
				result.routeLink = ctx.routeLink;
				ctx.async.terminateWorker(group);

				await router.push('second', {query: {foo: 3}});
				result.routeLink = ctx.routeLink;

				return result;

			}, engineName)).toEqual(
				engineName === 'historyApiRouterEngine' ?
					{
						initialContent: 'Main page',
						initialQuery: '',
						initialRouteLink: {},
						routeLink: {foo: 1}
					} :
					{
						initialContent: 'Main page',
						initialRouteLink: {},
						routeLink: {foo: 1}
					}
				);
		});
	});
}

module.exports = {
	initRouter,
	generateSimpleUsageCommonSpecs,
	generateWatchCommonSpecs
};
