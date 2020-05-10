/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

module.exports = async (page) => {
	const
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
			})).toBe('Index page');
		});

		it('moving back and forward from one page to another', async () => {
			expect(await root.evaluate(async (ctx) => {
				await ctx.router.push('index');
				return ctx.route.meta.content;
			})).toBe('Index page');

			expect(await root.evaluate(async (ctx) => {
				await ctx.router.push('second');
				return ctx.route.meta.content;
			})).toBe('Second page');

			expect(await root.evaluate(async (ctx) => {
				await ctx.router.back();
				return ctx.route.meta.content;
			})).toBe('Index page');

			expect(await root.evaluate(async (ctx) => {
				await ctx.router.forward();
				return ctx.route.meta.content;
			})).toBe('Second page');
		});
	});

	it('moving back and forward from one page to another by using .go', async () => {
		expect(await root.evaluate(async ({router}) => {
			await router.push('index');
			await router.push('second');
			await router.push('index');
			await router.push('second');
			return router.page.meta.content;
		})).toBe('Second page');

		expect(await root.evaluate(async ({router}) => {
			await router.go(-2);
			return router.page.meta.content;
		})).toBe('Second page');

		expect(await root.evaluate(async ({router}) => {
			await router.go(1);
			return router.page.meta.content;
		})).toBe('Index page');
	});

	it('getting an URL string by a query', async () => {
		expect(await root.evaluate(async ({router}) => router.getRoutePath('second', {query: {bla: 1}})))
			.toBe('/second?bla=1');

		expect(await root.evaluate(async ({router}) => router.getRoutePath('/', {query: {bla: 1}})))
			.toBe('/?bla=1');
	});

	it('getting page options by a query', async () => {
		const pageMeta = {
			path: '/second',
			remote: false,
			content: 'Second page',
			page: 'second',
			params: []
		};

		expect(await root.evaluate(async ({router}) => {
			const page = router.getPageOpts('second');
			return page.meta;
		})).toEqual(pageMeta);

		expect(await root.evaluate(async ({router}) => {
			const page = router.getPageOpts('/second');
			return page.meta;
		})).toEqual(pageMeta);
	});
};
