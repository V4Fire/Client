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
	// eslint-disable-next-line import/no-nodejs-modules
	const url = require('url');

	let
		root;

	beforeAll(async () => {
		root = await initRouter(page);
	});

	describe('b-router advanced transitions', () => {
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
				onRootTransition: [{foo: 1, bla: 1}, {foo: 1, bla: 1}]
			});
		});

		it('transition with root parameters', async () => {
			expect(await root.evaluate(async (ctx) => {
				const
					{router} = ctx;

				await router.push('/second');
				await router.push('/');

				// eslint-disable-next-line require-atomic-updates
				ctx.rootParam = 1;
				await router.push('second');

				// eslint-disable-next-line require-atomic-updates
				ctx.rootParam = undefined;

				return location.search;
			})).toBe('?rootParam=1');
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

			expect(await root.evaluate(({route}) => route.name)).toBe('secondAlias');
		});

		it('transition to an alias with redirect', async () => {
			expect(await root.evaluate(async (ctx) => {
				await ctx.router.push('/second/alias-redirect');
				return ctx.route.meta.content;
			})).toBe('Main page');

			expect(await root.evaluate(({route}) => route.name)).toBe('aliasToRedirect');
		});

		it('transition to chained aliases', async () => {
			expect(await root.evaluate(async (ctx) => {
				await ctx.router.push('/alias-to-alias');
				return ctx.route.meta.content;
			})).toBe('Second page');

			expect(await root.evaluate(({route}) => route.name)).toBe('aliasToAlias');
		});

		it('transition to an alias with parameters', async () => {
			expect(await root.evaluate(async (ctx) => {
				await ctx.router.push('/tpl-alias/foo/bar');
				return [location.pathname, ctx.route.params];
			})).toEqual(['/tpl-alias/foo/bar', {param1: 'foo', param2: 'bar'}]);
		});

		it('transition with redirect', async () => {
			expect(await root.evaluate(async (ctx) => {
				await ctx.router.push('/second/redirect');
				return ctx.route.meta.content;
			})).toBe('Second page');

			expect(await root.evaluate(({route}) => route.name)).toBe('second');
		});

		it('transition with redirect and alias', async () => {
			expect(await root.evaluate(async (ctx) => {
				await ctx.router.push('/redirect-alias');
				return ctx.route.meta.content;
			})).toBe('Second page');

			expect(await root.evaluate(({route}) => route.name)).toBe('secondAlias');
		});

		it('transition with chained redirect', async () => {
			expect(await root.evaluate(async (ctx) => {
				await ctx.router.push('/redirect-redirect');
				return ctx.route.meta.content;
			})).toBe('Second page');

			expect(await root.evaluate(({route}) => route.name)).toBe('second');
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
	});
};
