/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

module.exports = async (page) => {
	const
		url = require('url'),
		root = await (await page.$('.i-block-helper')).getProperty('component');

	describe('b-router', () => {
		it('checking the root', async () => {
			expect(await root.evaluate((ctx) => ctx.meta.params.root)).toBe(true);
		});

		it('checking the .route property', async () => {
			expect(await root.evaluate(({route}) => route)).not.toBeNull();
		});

		it('checking the .router property', async () => {
			expect(await root.evaluate(({router}) => router.componentName)).toBe('b-router');
		});

		it('"push" to a page by a route identifier', async () => {
			expect(await root.evaluate(async (ctx) => {
				await ctx.router.push('second');
				return ctx.route.meta.content;
			})).toBe('Second page');
		});

		it('"push" to a page by a path', async () => {
			expect(await root.evaluate(async (ctx) => {
				await ctx.router.push('/');
				return ctx.route.meta.content;
			})).toBe('Main page');
		});

		it('"replace" to a page by a path', async () => {
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

		it('"replace" to a page by null', async () => {
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

		it('checking the .activePage property', async () => {
			expect(await root.evaluate(async (ctx) => {
				await ctx.router.push('second');
				return ctx.activePage;
			})).toBe('second');

			expect(await root.evaluate(async (ctx) => {
				await ctx.router.push('main');
				return ctx.activePage;
			})).toBe('main');
		});

		it('transition to a route with path interpolating', async () => {
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

		it('soft transition', async () => {
			expect(await root.evaluate(async (ctx) => {
				const
					{router} = ctx;

				const
					result = {};

				await router.push('/second');
				await router.push('/');

				result.initialQuery = location.search;
				result.initialContent = ctx.route.meta.content;

				router.once('onSoftChange', (route) => {
					result.onSoftChange = [
						Object.fastClone(ctx.route.query),
						Object.fastClone(route.query)
					];
				});

				await router.push(null, {query: {foo: 1}});

				result.modifiedQuery = location.search;
				result.modifiedContent = ctx.route.meta.content;

				await router.push(null, {query: {bar: 2}});

				result.modifiedQuery2 = location.search;
				result.modifiedContent2 = ctx.route.meta.content;

				await router.push(null, {query: {foo: null, bar: undefined}});

				result.modifiedQuery3 = location.search;
				result.modifiedContent3 = ctx.route.meta.content;

				return result;

			})).toEqual({
				initialContent: 'Main page',
				initialQuery: '',

				modifiedContent: 'Main page',
				modifiedQuery: '?foo=1',
				onSoftChange: [{}, {foo: 1}],

				modifiedContent2: 'Main page',
				modifiedQuery2: '?bar=2&foo=1',

				modifiedContent3: 'Main page',
				modifiedQuery3: '?bar=2'
			});
		});

		it('transition event flow', async () => {
			expect(await root.evaluate(async (ctx) => {
				const
					{router} = ctx;

				const
					result = {};

				await router.push('/second');
				await router.push('/');

				result.initialQuery = location.search;
				result.initialContent = ctx.route.meta.content;

				router.once('onBeforeChange', (route, {query}) => {
					query.bla = 1;
				});

				router.once('onHardChange', (route) => {
					result.onHardChange = [
						Object.fastClone(ctx.route.query),
						Object.fastClone(route.query)
					];
				});

				router.once('onChange', (route) => {
					result.onChange = [
						Object.fastClone(ctx.route.query),
						Object.fastClone(route.query)
					];
				});

				router.once('onTransition', (route) => {
					result.onTransition = [
						Object.fastClone(ctx.route.query),
						Object.fastClone(route.query)
					];
				});

				ctx.rootEmitter.once('onTransition', (route) => {
					result.onRootTransition = [
						Object.fastClone(ctx.route.query),
						Object.fastClone(route.query)
					];
				});

				await router.push('second', {query: {foo: 1}});

				result.modifiedQuery = location.search;
				result.modifiedContent = ctx.route.meta.content;

				return result;

			})).toEqual({
				initialContent: 'Main page',
				initialQuery: '',

				modifiedContent: 'Second page',
				modifiedQuery: '?bla=1&foo=1',

				onHardChange: [{}, {foo: 1, bla: 1}],
				onChange: [{foo: 1, bla: 1}, {foo: 1, bla: 1}],
				onTransition: [{foo: 1, bla: 1}, {foo: 1, bla: 1}],
				onRootTransition: [{foo: 1, bla: 1}, {foo: 1, bla: 1}],
			});
		});

		it('transition with root parameters', async () => {
			expect(await root.evaluate(async (ctx) => {
				const
					{router} = ctx;

				await router.push('/second');
				await router.push('/');

				ctx.rootParam = 1;
				await router.push('second');
				ctx.rootParam = undefined;

				return location.search;
			})).toBe('?rootParam=1');
		});

		it('watching for route changes', async () => {
			expect(await root.evaluate(async (ctx) => {
				const
					{router} = ctx;

				const
					result = {routeChanges: [], queryChanges: []};

				await router.push('/second');
				await router.push('/');

				result.initialQuery = location.search;
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

			})).toEqual({
				initialContent: 'Main page',
				initialQuery: '',
				routeChanges: [[{foo: 1}, null]],
				queryChanges: [[{foo: 1}, null], [{foo: 2}, {foo: 1}]]
			});
		});

		it('linking for the route', async () => {
			expect(await root.evaluate(async (ctx) => {
				const
					{router} = ctx;

				const
					result = {};

				await router.push('/second');
				await router.push('/');

				result.initialQuery = location.search;
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

			})).toEqual({
				initialContent: 'Main page',
				initialQuery: '',
				initialRouteLink: {},
				routeLink: {foo: 1}
			});
		});

		it('transition to the default page', async () => {
			expect(await root.evaluate(async (ctx) => {
				await ctx.router.push('/some/fake/page');
				return ctx.route.meta.content;
			})).toBe('404');

			expect(await root.evaluate(({route}) => route.name)).toBe('notFound');
			expect(url.parse(await page.url()).pathname).toBe('/some/fake/page');
		});

		it('transition to an alias', async () => {
			expect(await root.evaluate(async (ctx) => {
				await ctx.router.push('/second/alias');
				return ctx.route.meta.content;
			})).toBe('Second page');

			expect(await root.evaluate(async ({route}) => route.name)).toBe('secondAlias');
		});

		it('transition to an alias with redirect', async () => {
			expect(await root.evaluate(async (ctx) => {
				await ctx.router.push('/second/alias-redirect');
				return ctx.route.meta.content;
			})).toBe('Main page');

			expect(await root.evaluate(async ({route}) => route.name)).toBe('aliasToRedirect');
		});

		it('transition to chained aliases', async () => {
			expect(await root.evaluate(async (ctx) => {
				await ctx.router.push('/alias-to-alias');
				return ctx.route.meta.content;
			})).toBe('Second page');

			expect(await root.evaluate(async ({route}) => route.name)).toBe('aliasToAlias');
		});

		it('transition with redirect', async () => {
			expect(await root.evaluate(async (ctx) => {
				await ctx.router.push('/second/redirect');
				return ctx.route.meta.content;
			})).toBe('Second page');

			expect(await root.evaluate(async ({route}) => route.name)).toBe('second');
		});

		it('transition with redirect and alias', async () => {
			expect(await root.evaluate(async (ctx) => {
				await ctx.router.push('/redirect-alias');
				return ctx.route.meta.content;
			})).toBe('Second page');

			expect(await root.evaluate(async ({route}) => route.name)).toBe('secondAlias');
		});

		it('transition with chained redirect', async () => {
			expect(await root.evaluate(async (ctx) => {
				await ctx.router.push('/redirect-redirect');
				return ctx.route.meta.content;
			})).toBe('Second page');

			expect(await root.evaluate(async ({route}) => route.name)).toBe('second');
		});

		it('moving back and forward from one page to another', async () => {
			expect(await root.evaluate(async (ctx) => {
				await ctx.router.push('main');
				return ctx.route.meta.content;
			})).toBe('Main page');

			expect(await root.evaluate(async (ctx) => {
				await ctx.router.push('second');
				return ctx.route.meta.content;
			})).toBe('Second page');

			expect(await root.evaluate(async (ctx) => {
				await ctx.router.back();
				return ctx.route.meta.content;
			})).toBe('Main page');

			expect(await root.evaluate(async (ctx) => {
				await ctx.router.forward();
				return ctx.route.meta.content;
			})).toBe('Second page');
		});

		it('moving back and forward from one page to another by using .go', async () => {
			expect(await root.evaluate(async ({router}) => {
				await router.push('main');
				await router.push('second');
				await router.push('main');
				await router.push('second');
				return router.route.meta.content;
			})).toBe('Second page');

			expect(await root.evaluate(async ({router}) => {
				await router.go(-2);
				return router.route.meta.content;
			})).toBe('Second page');

			expect(await root.evaluate(async ({router}) => {
				await router.go(1);
				return router.route.meta.content;
			})).toBe('Main page');
		});

		it('updating of the routes', async () => {
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

		it('updating of the base path', async () => {
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
			expect(await root.evaluate(async ({router}) => router.getRoutePath('second', {query: {bla: 1}})))
				.toBe('/second?bla=1');

			expect(await root.evaluate(async ({router}) => router.getRoutePath('/', {query: {bla: 1}})))
				.toBe('/?bla=1');
		});

		it('getting route parameters by a query', async () => {
			const pageMeta = {
				name: 'second',
				page: 'second',
				path: '/second',
				default: false,
				external: false,
				content: 'Second page',
				params: []
			};

			expect(await root.evaluate(async ({router}) => {
				const route = router.getRoute('second');
				return route.meta;
			})).toEqual(pageMeta);

			expect(await root.evaluate(async ({router}) => {
				const route = router.getRoute('/second');
				return route.meta;
			})).toEqual(pageMeta);
		});
	});
};
