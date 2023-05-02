/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */
import type { JSHandle } from 'playwright';

import type iStaticPage from 'components/super/i-static-page/i-static-page';

import test from 'tests/config/unit/test';

import { Component } from 'tests/helpers';

import type { EngineName, RouterTestResult } from 'components/base/b-router/test/interface';
import { createInitRouter } from 'components/base/b-router/test/helpers';

test.describe('<b-router> transition', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test.describe('using `history` engine', () => {
		generateSpecs('history');

		test.describe('transition to a route with the path interpolation', () => {
			test('providing original parameters', async ({page}) => {
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

			test('providing aliases', async ({page}) => {
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

	test.describe('using `in-memory` engine', () => {
		generateSpecs('in-memory');
	});
});

/**
 * Generates common specs for all router engines of "transition" runners
 *
 * @param engineName
 */
function generateSpecs(engineName: EngineName) {
	const initRouter = createInitRouter(engineName);

	let root: JSHandle<iStaticPage>;

	test.beforeEach(async ({page}) => {
		root = await initRouter(page);
	});

	test('transition to the default page', async ({page}) => {
		await test.expect(root.evaluate(async (ctx) => {
			await ctx.router!.push('/some/fake/page');
			return ctx.route!.meta.content;
		})).resolves.toBe('404');

		await test.expect(root.evaluate(({route}) => route!.name)).resolves.toBe('notFound');

		if (engineName === 'history') {
			test.expect(new URL(await page.url()).pathname).toBe('/some/fake/page');
		}
	});

	test('transition to an alias with parameters', async ({page}) => {
		await test.expect(root.evaluate(async (ctx) => {
			await ctx.router!.push('/tpl-alias/foo/bar');
			return ctx.route!.params;
		})).resolves.toEqual({param1: 'foo', param2: 'bar'});

		if (engineName === 'history') {
			test.expect(new URL(await page.url()).pathname).toBe('/tpl-alias/foo/bar');
		}
	});

	test('transition to an alias', async () => {
		await test.expect(root.evaluate(async (ctx) => {
			await ctx.router!.push('/second/alias');
			return ctx.route!.meta.content;
		})).resolves.toBe('Second page');

		await test.expect(root.evaluate(({route}) => route!.name)).resolves.toBe('secondAlias');
	});

	test('transition to an alias with redirect', async () => {
		await test.expect(root.evaluate(async (ctx) => {
			await ctx.router!.push('/second/alias-redirect');
			return ctx.route!.meta.content;
		})).resolves.toBe('Main page');

		await test.expect(root.evaluate(({route}) => route!.name)).resolves.toBe('aliasToRedirect');
	});

	test('transition to chained aliases', async () => {
		await test.expect(root.evaluate(async (ctx) => {
			await ctx.router!.push('/alias-to-alias');
			return ctx.route!.meta.content;
		})).resolves.toBe('Second page');

		await test.expect(root.evaluate(({route}) => route!.name)).resolves.toBe('aliasToAlias');
	});

	test('transition with redirect', async () => {
		await test.expect(root.evaluate(async (ctx) => {
			await ctx.router!.push('/second/redirect');
			return ctx.route!.meta.content;
		})).resolves.toBe('Second page');

		await test.expect(root.evaluate(({route}) => route!.name)).resolves.toBe('second');
	});

	test('transition with redirect and alias', async () => {
		await test.expect(root.evaluate(async (ctx) => {
			await ctx.router!.push('/redirect-alias');
			return ctx.route!.meta.content;
		})).resolves.toBe('Second page');

		await test.expect(root.evaluate(({route}) => route!.name)).resolves.toBe('secondAlias');
	});

	test('transition with chained redirect', async () => {
		await test.expect(root.evaluate(async (ctx) => {
			await ctx.router!.push('/redirect-redirect');
			return ctx.route!.meta.content;
		})).resolves.toBe('Second page');

		await test.expect(root.evaluate(({route}) => route!.name)).resolves.toBe('second');
	});

	test('moving back and forward from one page to another', async () => {
		await test.expect(root.evaluate(async (ctx) => {
			await ctx.router!.push('main');
			return ctx.route!.meta.content;
		})).resolves.toBe('Main page');

		await test.expect(root.evaluate(async (ctx) => {
			await ctx.router!.push('second');
			return ctx.route!.meta.content;
		})).resolves.toBe('Second page');

		await test.expect(root.evaluate(async (ctx) => {
			await ctx.router!.back();
			return ctx.route!.meta.content;
		})).resolves.toBe('Main page');

		await test.expect(root.evaluate(async (ctx) => {
			await ctx.router!.forward();
			return ctx.route!.meta.content;
		})).resolves.toBe('Second page');
	});

	test('moving back and forward from one page to another by using .go', async () => {
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

	test('soft transition', async () => {
		await test.expect(root.evaluate(async (ctx) => {
			const
				{router} = ctx;

			const
				result: RouterTestResult = {queryChanges: [], contentChanges: []};

			await router!.push('/second');
			await router!.push('/');

			result.initialQuery = location.search;
			result.initialContent = ctx.route!.meta.content;

			router!.on('onSoftChange', (route) => {
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

	test('transition event flow', async () => {
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

			router!.once('onHardChange', (route) => {
				result.onHardChange = [
					Object.fastClone(ctx.route!.query),
					Object.fastClone(route.query)
				];
			});

			router!.once('onChange', (route) => {
				result.onChange = [
					Object.fastClone(ctx.route!.query),
					Object.fastClone(route.query)
				];
			});

			router!.once('onTransition', (route) => {
				result.onTransition = [
					Object.fastClone(ctx.route!.query),
					Object.fastClone(route.query)
				];
			});

			ctx.unsafe.rootEmitter.once('onTransition', (route) => {
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

	test('transition with root parameters', async () => {
		await test.expect(root.evaluate(async (ctx) => {
			const
				{router} = ctx;

			await router!.push('/second');
			await router!.push('/');

			// eslint-disable-next-line require-atomic-updates
			ctx.rootParam = 1;
			await router!.push('second');

			// eslint-disable-next-line require-atomic-updates
			ctx.rootParam = undefined;

			return {
				queryObject: ctx.route!.query,
				queryString: location.search
			};
		})).resolves.toEqual({
			queryObject: {rootParam: 1},
			queryString: engineName === 'in-memory' ? '' : '?rootParam=1'
		});
	});
}
