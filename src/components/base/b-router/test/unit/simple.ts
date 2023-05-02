/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */
import type { JSHandle } from 'playwright';

import type iPage from 'components/super/i-page/i-page';

import test from 'tests/config/unit/test';

import type { EngineName } from 'components/base/b-router/test/interface';
import { createInitRouter } from 'components/base/b-router/test/helpers';

test.describe('<b-router> simple', () => {
	const initRouter = createInitRouter('history');

	let root: JSHandle<iPage>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		root = await initRouter(page);
	});

	test.describe('using `history` engine', () => {
		generateSpecs('history');

		test('checking the `route` property', async () => {
			await test.expect(root.evaluate(({route}) => route != null)).resolves.toBeTruthy();
		});

		test('`replace` a page by a path', async () => {
			await test.expect(root.evaluate(async (ctx) => {
				const
					historyLength = history.length,
					res: Dictionary = {};

				await ctx.router!.replace('second');

				res.content = ctx.route!.meta.content;
				res.lengthDoesntChange = historyLength === history.length;

				return res;

			})).resolves.toEqual({
				content: 'Second page',
				lengthDoesntChange: true
			});
		});

		test('`replace` a page by null', async () => {
			await test.expect(root.evaluate(async (ctx) => {
				const
					{router} = ctx;

				await router!.replace('/');

				const
					historyLength = history.length,
					res: Dictionary = {};

				await router!.replace('second');
				await router!.replace(null, {query: {bla: 1}});

				res.content = ctx.route!.meta.content;
				res.query = location.search;
				res.lengthDoesntChange = historyLength === history.length;

				return res;

			})).resolves.toEqual({
				query: '?bla=1',
				content: 'Second page',
				lengthDoesntChange: true
			});
		});
	});

	test.describe('using `in-memory` engine', () => {
		generateSpecs('in-memory');

		test('checking the `route` property with `initialRoute`', async () => {
			await test.expect(root.evaluate(({route}) => route != null)).resolves.toBeTruthy();
		});

		// FIXME: broken test
		test('checking the `route` property without `initialRoute`', async ({page}) => {
			const root = await initRouter(page, {initialRoute: null});
			await test.expect(root.evaluate(({route}) => route == null)).resolves.toBeTruthy();
		});

		test('`replace` a page by a path', async () => {
			await test.expect(root.evaluate(async (ctx) => {
				const
					{router} = ctx,
					historyLength = router!.unsafe.engine.history.length,
					res: Dictionary = {};

				await router!.replace('second');

				res.content = ctx.route!.meta.content;
				res.lengthDoesntChange = historyLength === router!.unsafe.engine.history.length;

				return res;

			})).resolves.toEqual({
				content: 'Second page',
				lengthDoesntChange: true
			});
		});

		test('`replace` a page by null', async () => {
			await test.expect(root.evaluate(async (ctx) => {
				const
					{router} = ctx;

				await router!.replace('/');

				const
					historyLength = router!.unsafe.engine.history.length,
					res: Dictionary = {};

				await router!.replace('second');
				await router!.replace(null, {query: {bla: 1}});

				res.content = ctx.route!.meta.content;
				res.lengthDoesntChange = historyLength === router!.unsafe.engine.history.length;

				return res;

			})).resolves.toEqual({
				content: 'Second page',
				lengthDoesntChange: true
			});
		});
	});
});

/**
 * Generates common specs for all router engines of "simple" runners
 *
 * @param engineName
 */
function generateSpecs(engineName: EngineName) {
	const initRouter = createInitRouter(engineName);

	let root: JSHandle<iPage>;

	test.beforeEach(async ({page}) => {
		root = await initRouter(page);
	});

	test('checking the root', async () => {
		test.expect(await root.evaluate((ctx) => ctx.unsafe.meta.params.root)).toBe(true);
	});

	test('checking the `router` property', async () => {
		test.expect(await root.evaluate(({router}) => router?.componentName)).toBe('b-router');
	});

	test('`push` a page by a route identifier', async () => {
		await test.expect(root.evaluate(async (ctx) => {
			await ctx.router!.push('second');
			return ctx.route!.meta.content;
		})).resolves.toBe('Second page');
	});

	test('`push` a page by a path', async () => {
		await test.expect(root.evaluate(async (ctx) => {
			await ctx.router!.push('/');
			return ctx.route!.meta.content;
		})).resolves.toBe('Main page');
	});

	test('checking the `activePage` property', async () => {
		await test.expect(root.evaluate(async (ctx) => {
			await ctx.router!.push('second');
			return ctx.activePage;
		})).resolves.toBe('second');

		await test.expect(root.evaluate(async (ctx) => {
			await ctx.router!.push('main');
			return ctx.activePage;
		})).resolves.toBe('main');
	});

	test('updating of routes', async () => {
		await test.expect(root.evaluate(async (ctx) => {
			const
				{router} = ctx;

			const
				res: Dictionary = {},
				oldRoutes = ctx.router!.routes;

			await router!.updateRoutes({
				main: {
					path: '/',
					default: true,
					content: 'Dynamic main page'
				}
			});

			res.dynamicPage = ctx.route!.meta.content;

			router!.routes = oldRoutes;
			router!.routeStore = undefined;

			await router!.initRoute('main');
			res.restoredPage = ctx.route!.meta.content;

			return res;

		})).resolves.toEqual({
			dynamicPage: 'Dynamic main page',
			restoredPage: 'Main page'
		});
	});

	test('updating of a base path', async () => {
		await test.expect(root.evaluate(async (ctx) => {
			const
				{router} = ctx;

			const
				res: Dictionary = {},
				oldRoutes = ctx.router!.routes;

			await router!.updateRoutes('/demo', '/demo/second', {
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

			res.dynamicPage = ctx.route!.meta.content;

			router!.basePath = '/';
			router!.routes = oldRoutes;
			router!.routeStore = undefined;

			await router!.initRoute('/');
			res.restoredPage = ctx.route!.meta.content;

			return res;

		})).resolves.toEqual({
			dynamicPage: 'Dynamic second page',
			restoredPage: 'Main page'
		});
	});

	test('getting URL by a query', async () => {
		test.expect(await root.evaluate(({router}) => router!.getRoutePath('second', {query: {bla: 1}})))
			.toBe('/second?bla=1');

		test.expect(await root.evaluate(({router}) => router!.getRoutePath('/', {query: {bla: 1}})))
			.toBe('/?bla=1');
	});

	// FIXME: broken test
	test('getting route parameters by a query', async () => {
		const pageMeta = {
			name: 'main',
			page: 'main',
			path: '/',
			default: false,
			external: false,
			content: 'Main page'
		};

		await test.expect(root.evaluate(({router}) => {
			const route = router!.getRoute('main');
			return route!.meta;
		})).resolves.toEqual(pageMeta);

		await test.expect(root.evaluate(({router}) => {
			const route = router!.getRoute('/');
			return route!.meta;
		})).resolves.toEqual(pageMeta);
	});
}
