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

		it('transition to a route with path interpolating', async () => {
			expect(await root.evaluate(async (ctx) => {
				const
					result = {},
					s = () => ctx.location.pathname + ctx.location.search;

				await ctx.router.push('template', {params: {param1: 'foo'}});
				result.path1 = s();

				await ctx.router.push('template', {params: {param1: 'foo'}, query: {param2: 109}});
				result.path2 = s();

				await ctx.router.push('/strict-tpl/:param1', {params: {param1: 'foo'}, query: {param2: 109}});
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
					result = {};

				await ctx.router.push('/');

				result.initialQuery = ctx.location.search;
				result.initialContent = ctx.route.meta.content;

				ctx.router.once('onSoftChange', (route) => {
					result.onSoftChange = [
						Object.fastClone(ctx.route.query),
						Object.fastClone(route.query)
					];
				});

				await ctx.router.push(null, {query: {foo: 1}});

				result.modifiedQuery = ctx.location.search;
				result.modifiedContent = ctx.route.meta.content;

				await ctx.router.push(null, {query: {bar: 2}});

				result.modifiedQuery2 = ctx.location.search;
				result.modifiedContent2 = ctx.route.meta.content;

				await ctx.router.push(null, {query: {foo: null, bar: undefined}});

				result.modifiedQuery3 = ctx.location.search;
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

	it('getting an URL string by a query', async () => {
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
};
