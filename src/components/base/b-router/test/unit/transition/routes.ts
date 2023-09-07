/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';

import test from 'tests/config/unit/test';

import { createInitRouter } from 'components/base/b-router/test/helpers';
import type { EngineName } from 'components/base/b-router/test/interface';

import type iStaticPage from 'components/super/i-static-page/i-static-page';

test.describe('<b-router> route handling', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	(<EngineName[]>['in-memory', 'history']).forEach((engine) => {
		test.describe(`with the \`${engine}\` engine`, () => {
			generateSpecs(engine);
		});
	});

	function generateSpecs(engineName: EngineName) {
		const initRouter = createInitRouter(engineName, {
			main: {
				path: '/',
				content: 'Main page'
			},

			second: {
				// The path should not match the page identifier so that we can test the non-normalized path as an argument
				path: '/second-page',
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
				path: '/tpl/:param1/:param2?',
				pathOpts: {
					aliases: {
						param1: ['_param1', 'Param1'],
						param2: ['Param2']
					}
				}
			},

			strictTemplate: {
				paramsFromQuery: false,
				path: '/strict-tpl/:param1/:param2?'
			},

			templateAlias: {
				path: '/tpl-alias/:param1/:param2?',
				alias: 'template'
			},

			redirectTemplate: {
				path: '/tpl/redirect/:param1/:param2',
				redirect: 'template'
			},

			notFound: {
				default: true,
				content: '404'
			}
		});

		let
			root: JSHandle<iStaticPage>;

		test.beforeEach(async ({page}) => {
			root = await initRouter(page);
		});

		test('should switch to the default page if the specified route was not found', async ({page}) => {
			await assertPathTransitionsTo('/some/fake/page', '404');
			await assertRouteNameIs('notFound');

			// eslint-disable-next-line playwright/no-conditional-in-test
			if (engineName === 'history') {
				test.expect(new URL(page.url()).pathname).toBe('/some/fake/page');
			}
		});

		test(
			[
				'should switch to the original page using an alias path,',
				'but the route name should match the name of the alias route'
			].join(' '),

			async () => {
				await assertPathTransitionsTo('/second/alias', 'Second page');
				await assertActivePageIs('second');
				await assertRouteNameIs('secondAlias');
			}
		);

		test(
			[
				'should switch to the original page using an alias path with the parameters,',
				'but the page URL should have the path of the alias route'
			].join(' '),

			async ({page}) => {
				await test.expect(root.evaluate(async (ctx) => {
					await ctx.router?.push('/tpl-alias/foo/bar');
					return ctx.route?.params;
				})).resolves.toEqual({param1: 'foo', param2: 'bar'});

				await assertActivePageIs('template');

				// eslint-disable-next-line playwright/no-conditional-in-test
				if (engineName === 'history') {
					test.expect(new URL(page.url()).pathname).toBe('/tpl-alias/foo/bar');
				}
			}
		);

		test(
			[
				'should redirect to the main page using an alias path,',
				'which points to a redirect route that subsequently redirects to the main page'
			].join(' '),

			async () => {
				await assertPathTransitionsTo('/second/alias-redirect', 'Main page');
				await assertActivePageIs('main');
				await assertRouteNameIs('aliasToRedirect');
			}
		);

		test('should switch to the original page using the chained aliases', async () => {
			await assertPathTransitionsTo('/alias-to-alias', 'Second page');
			await assertActivePageIs('second');
			await assertRouteNameIs('aliasToAlias');
		});

		test.describe('should redirect to the page using the redirect path', () => {
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
					test.expect(new URL(page.url()).pathname).toBe('/tpl/1/2');
				}
			});
		});

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
			})).toBeResolvedTo('Main page');

			await test.expect(root.evaluate(async (ctx) => {
				await ctx.router!.forward();
				return ctx.route!.meta.content;
			})).toBeResolvedTo('Second page');
		});

		test('`go` method should navigate back and forth between one page and another', async () => {
			await test.expect(root.evaluate(async (ctx) => {
				const
					router = ctx.router!;

				await router.push('main');
				await router.push('second');
				await router.push('main');
				await router.push('second');

				return router.route!.meta.content;
			})).toBeResolvedTo('Second page');

			await test.expect(root.evaluate(async (ctx) => {
				const router = ctx.router!;
				await router.go(-2);
				return router.route?.meta.content;
			})).toBeResolvedTo('Second page');

			await test.expect(root.evaluate(async (ctx) => {
				const router = ctx.router!;
				await router.go(1);
				return router.route?.meta.content;
			})).toBeResolvedTo('Main page');
		});

		test('should transition by setting arbitrary properties on the root component', async () => {
			const transition = root.evaluate(async (ctx) => {
				const
					router = ctx.router!;

				await router.push('/second');
				await router.push('/');

				// eslint-disable-next-line require-atomic-updates
				ctx['rootParam'] = 1;

				await router.push('second');

				// eslint-disable-next-line require-atomic-updates
				ctx['rootParam'] = undefined;

				return {
					queryObject: ctx.route?.query,
					queryString: location.search
				};
			});

			await test.expect(transition).resolves.toEqual({
				queryObject: {rootParam: 1},
				queryString: engineName === 'in-memory' ? '' : '?rootParam=1'
			});
		});

		async function assertPathTransitionsTo(path: string, content: string) {
			await test.expect(root.evaluate(async (ctx, path) => {
				await ctx.router!.push(path);
				return ctx.route!.meta.content;
			}, path)).toBeResolvedTo(content);
		}

		async function assertActivePageIs(routeId: string) {
			await test.expect(root.evaluate(({activePage}) => activePage)).resolves.toEqual(routeId);
		}

		async function assertRouteNameIs(name: string) {
			await test.expect(root.evaluate(({route}) => route!.name)).toBeResolvedTo(name);
		}
	}
});
