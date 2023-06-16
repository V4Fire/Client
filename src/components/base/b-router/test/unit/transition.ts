/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';

import test from 'tests/config/unit/test';
import { Component } from 'tests/helpers';

import type iStaticPage from 'components/super/i-static-page/i-static-page';

import type { EngineName, RouterTestResult } from 'components/base/b-router/test/interface';
import { createInitRouter } from 'components/base/b-router/test/helpers';

test.describe('<b-router> transition', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test.describe('with `history` engine', () => {
		generateSpecs('history');

		test.describe('should transition to a route interpolating the path', () => {
			test('with original parameters', async ({page}) => {
				const root: JSHandle<iStaticPage> = await Component.waitForRoot(page);

				await test.expect(root.evaluate(async (ctx) => {
					const
						{router} = ctx;

					const
						result: Dictionary<string> = {},
						s = () => location.pathname + location.search;

					await router!.push('template', {params: {param1: 'foo'}});
					result.path1 = s();

					await router!.push('template', {params: {param1: 'foo'}, query: {param2: 109}});
					result.path2 = s();

					await router!.push('/strict-tpl/:param1', {params: {param1: 'foo'}, query: {param2: 109}});
					result.path3 = s();

					return result;

				})).resolves.toEqual({
					path1: '/tpl/foo',
					path2: '/tpl/foo/109',
					path3: '/strict-tpl/foo?param2=109'
				});
			});

			test('with aliases', async ({page}) => {
				const root: JSHandle<iStaticPage> = await Component.waitForRoot(page);

				await test.expect(root.evaluate(async (ctx) => {
					const
						{router} = ctx;

					const
						result: Dictionary<string> = {},
						s = () => location.pathname + location.search;

					await router!.push('template', {params: {param1: 'foo'}});
					result.path1 = s();

					await router!.push('template', {params: {param1: 'foo', _param1: 'bar'}});
					result.path2 = s();

					await router!.push('template', {params: {Param1: 'foo'}});
					result.path3 = s();

					await router!.push('template', {params: {Param1: 'bar', _param1: 'foo'}});
					result.path4 = s();

					await router!.push('template', {params: {_param1: 'foo'}, query: {Param1: 'bla', Param2: 'bar'}});
					result.path5 = s();

					return result;

				})).resolves.toEqual({
					path1: '/tpl/foo',
					path2: '/tpl/foo',
					path3: '/tpl/foo',
					path4: '/tpl/foo',
					path5: '/tpl/foo/bar?Param1=bla'
				});
			});
		});
	});

	test.describe('with `in-memory` engine', () => {
		generateSpecs('in-memory');
	});
});

/**
 * Generates common specs for all router engines of "transition" runners
 * @param engineName
 */
function generateSpecs(engineName: EngineName) {
	/* eslint-disable playwright/require-top-level-describe */
	const initRouter = createInitRouter(engineName);

	let root: JSHandle<iStaticPage>;

	test.beforeEach(async ({page}) => {
		root = await initRouter(page);
	});

	test('should switch to the default page if the specified route was not found', async ({page}) => {
		await assertPathTransitionsTo('/some/fake/page', '404');
		await assertRouteNameIs('notFound');

		// eslint-disable-next-line playwright/no-conditional-in-test
		if (engineName === 'history') {
			test.expect(new URL(await page.url()).pathname).toBe('/some/fake/page');
		}
	});

	test([
		'should switch to the original page using an alias path,',
		'but the route name should match the name of the alias route'
	].join(' '), async () => {
		await assertPathTransitionsTo('/second/alias', 'Second page');
		await assertActivePageIs('second');
		await assertRouteNameIs('secondAlias');
	});

	test([
		'should switch to the original page using an alias path with the parameters,',
		'but the page URL should have the path of the alias route'
	].join(' '), async ({page}) => {
		await test.expect(root.evaluate(async (ctx) => {
			await ctx.router!.push('/tpl-alias/foo/bar');
			return ctx.route!.params;
		})).resolves.toEqual({param1: 'foo', param2: 'bar'});

		await assertActivePageIs('template');

		// eslint-disable-next-line playwright/no-conditional-in-test
		if (engineName === 'history') {
			test.expect(new URL(await page.url()).pathname).toBe('/tpl-alias/foo/bar');
		}
	});

	test([
		'should redirect to the main page using an alias path,',
		'which points to a redirect route that subsequently redirects to the main page'
	].join(' '), async () => {
		await assertPathTransitionsTo('/second/alias-redirect', 'Main page');
		await assertActivePageIs('main');
		await assertRouteNameIs('aliasToRedirect');
	});

	test('should switch to the original page using the chained aliases', async () => {
		await assertPathTransitionsTo('/alias-to-alias', 'Second page');
		await assertActivePageIs('second');
		await assertRouteNameIs('aliasToAlias');
	});

	test.describe('should redirect to the page using a redirect path', () => {
		test('without parameters', async () => {
			await assertPathTransitionsTo('/second/redirect', 'Second page');
			await assertActivePageIs('second');
			await assertRouteNameIs('second');
		});

		test('with parameters', async ({page}) => {
			await test.expect(root.evaluate(async (ctx) => {
				await ctx.router?.push('/tpl/redirect/1/2');
				return ctx.route?.params;
			})).resolves.toEqual({param1: '1', param2: '2'});

			await assertActivePageIs('template');

			// eslint-disable-next-line playwright/no-conditional-in-test
			if (engineName === 'history') {
				test.expect(new URL(await page.url()).pathname).toBe('/tpl/1/2');
			}
		});
	})

	test('should redirect to the page using an alias path with the redirect', async () => {
		await assertPathTransitionsTo('/redirect-alias', 'Second page');
		await assertActivePageIs('second');
		await assertRouteNameIs('secondAlias');
	});

	test('should redirect to the page using the chained redirect', async () => {
		await assertPathTransitionsTo('/redirect-redirect', 'Second page');
		await assertActivePageIs('second');
		await assertRouteNameIs('second');
	});

	test([
		'`back` and `forward` methods',
		'should navigate back and forth between one page and another'
	].join(' '), async () => {
		await assertPathTransitionsTo('main', 'Main page');
		await assertPathTransitionsTo('second', 'Second page');

		await test.expect(root.evaluate(async (ctx) => {
			await ctx.router!.back();
			return ctx.route!.meta.content;
		})).resolves.toBe('Main page');

		await test.expect(root.evaluate(async (ctx) => {
			await ctx.router!.forward();
			return ctx.route!.meta.content;
		})).resolves.toBe('Second page');
	});

	test('`go` method should navigate back and forth between one page and another', async () => {
		await test.expect(root.evaluate(async ({router}) => {
			await router!.push('main');
			await router!.push('second');
			await router!.push('main');
			await router!.push('second');
			return router!.route!.meta.content;
		})).resolves.toBe('Second page');

		await test.expect(root.evaluate(async ({router}) => {
			await router!.go(-2);
			return router!.route!.meta.content;
		})).resolves.toBe('Second page');

		await test.expect(root.evaluate(async ({router}) => {
			await router!.go(1);
			return router!.route!.meta.content;
		})).resolves.toBe('Main page');
	});

	test('should emit `softChange` when only the route query is changing', async () => {
		await test.expect(root.evaluate(async (ctx) => {
			const
				{router} = ctx;

			const
				result: RouterTestResult = {queryChanges: [], contentChanges: []};

			await router!.push('/second');
			await router!.push('/');

			result.initialQuery = location.search;
			result.initialContent = ctx.route!.meta.content;

			router!.on('onSoftChange', (route: any) => {
				if (result.onSoftChange != null) {
					result.onSoftChange.push(Object.fastClone(route.query));

				} else {
					result.onSoftChange = [
						Object.fastClone(ctx.route!.query),
						Object.fastClone(route.query)
					];
				}
			});

			await router!.push(null, {query: {foo: 1}});

			result.queryChanges!.push(location.search);
			result.contentChanges!.push(ctx.route!.meta.content);

			await router!.push(null, {query: {bar: 2}});

			result.queryChanges!.push(location.search);
			result.contentChanges!.push(ctx.route!.meta.content);

			await router!.push(null, {query: {foo: null, bar: undefined}});

			result.queryChanges!.push(location.search);
			result.contentChanges!.push(ctx.route!.meta.content);

			await router!.push(null, {query: {bla: [1, 2]}});

			result.queryChanges!.push(location.search);
			result.contentChanges!.push(ctx.route!.meta.content);

			await router!.push(null, {query: {bla: [3]}});

			result.queryChanges!.push(location.search);
			result.contentChanges!.push(ctx.route!.meta.content);

			return result;

		})).resolves.toEqual({
			initialContent: 'Main page',
			initialQuery: '',
			queryChanges: [
				engineName === 'in-memory' ? '' : '?foo=1',
				engineName === 'in-memory' ? '' : '?bar=2&foo=1',
				engineName === 'in-memory' ? '' : '?bar=2',
				engineName === 'in-memory' ? '' : '?bar=2&bla=1&bla=2',
				engineName === 'in-memory' ? '' : '?bar=2&bla=3'
			],
			contentChanges: Array(5).fill('Main page'),
			onSoftChange: [
				{},
				{foo: 1},
				{foo: 1, bar: 2},
				{foo: null, bar: 2},
				{foo: null, bar: 2, bla: [1, 2]},
				{foo: null, bar: 2, bla: [3]}
			]
		});
	});

	test('should emit various events while transitioning to the other page', async () => {
		await test.expect(root.evaluate(async (ctx) => {
			const
				{router} = ctx;

			const
				result: RouterTestResult = {};

			await router!.push('/second');
			await router!.push('/');

			result.initialQuery = location.search;
			result.initialContent = ctx.route!.meta.content;

			router!.once('onBeforeChange', (route, {query}) => {
				query.bla = 1;
			});

			router!.once('onHardChange', (route: any) => {
				result.onHardChange = [
					Object.fastClone(ctx.route!.query),
					Object.fastClone(route.query)
				];
			});

			router!.once('onChange', (route: any) => {
				result.onChange = [
					Object.fastClone(ctx.route!.query),
					Object.fastClone(route.query)
				];
			});

			router!.once('onTransition', (route: any) => {
				result.onTransition = [
					Object.fastClone(ctx.route!.query),
					Object.fastClone(route.query)
				];
			});

			ctx.unsafe.rootEmitter.once('onTransition', (route: any) => {
				result.onRootTransition = [
					Object.fastClone(ctx.route!.query),
					Object.fastClone(route.query)
				];
			});

			await router!.push('second', {query: {foo: 1}});

			result.queryChanges = [location.search];
			result.contentChanges = [ctx.route!.meta.content];

			return result;

		})).resolves.toEqual({
			initialContent: 'Main page',
			initialQuery: '',

			contentChanges: ['Second page'],
			queryChanges: [engineName === 'in-memory' ? '' : '?bla=1&foo=1'],

			onHardChange: [{}, {foo: 1, bla: 1}],
			onChange: [{foo: 1, bla: 1}, {foo: 1, bla: 1}],
			onTransition: [{foo: 1, bla: 1}, {foo: 1, bla: 1}],
			onRootTransition: [{foo: 1, bla: 1}, {foo: 1, bla: 1}]
		});
	});

	test('should transition by setting arbitrary properties on the root component', async () => {
		await test.expect(root.evaluate(async (ctx) => {
			const
				{router} = ctx;

			await router!.push('/second');
			await router!.push('/');

			(<any>ctx).rootParam = 1;
			await router!.push('second');
			(<any>ctx).rootParam = undefined;

			return {
				queryObject: ctx.route!.query,
				queryString: location.search
			};
		})).resolves.toEqual({
			queryObject: {rootParam: 1},
			queryString: engineName === 'in-memory' ? '' : '?rootParam=1'
		});
	});

	/**
	 * Asserts that the given path transitions to the page with the specified content
	 *
	 * @param path
	 * @param content
	 */
	async function assertPathTransitionsTo(path: string, content: string) {
		await test.expect(root.evaluate(async (ctx, path) => {
			await ctx.router!.push(path);
			return ctx.route!.meta.content;
		}, path)).resolves.toBe(content);
	}

	/**
	 * Asserts that the `activePage` of root component matches the specified identifier
	 * @param routeId
	 */
	async function assertActivePageIs(routeId: string) {
		await test.expect(root.evaluate(({activePage}) => activePage)).resolves.toEqual(routeId);
	}

	/**
	 * Asserts that the `route` name of the root component matches the specified name
	 * @param name
	 */
	async function assertRouteNameIs(name: string) {
		await test.expect(root.evaluate(({route}) => route!.name)).resolves.toBe(name);
	}
}
