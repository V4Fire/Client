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

// eslint-disable-next-line max-lines-per-function
test.describe('<b-router> route handling', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	(<EngineName[]>['in-memory', 'history']).forEach((engine) => {
		test.describe(`with the \`${engine}\` engine`, () => {
			generateSpecs(engine);
		});
	});

	// eslint-disable-next-line max-lines-per-function
	function generateSpecs(engineName: EngineName) {
		test(
			'should switch to the default page if the specified route was not found',

			async ({page}) => {
				const root = await createInitRouter(engineName, {
					main: {
						path: '/'
					},

					notFound: {
						default: true,
						content: '404'
					}
				})(page, {
					initialRoute: 'main'
				});

				await assertPathTransitionsTo(root, '/some/fake/page', '404');
				await assertRouteNameIs(root, 'notFound');

				// eslint-disable-next-line playwright/no-conditional-in-test
				if (engineName === 'history') {
					test.expect(new URL(page.url()).pathname).toBe('/some/fake/page');
				}
			}
		);

		test(
			[
				'should switch to the original page using an alias path,',
				'but the route name should match the name of the alias route'
			].join(' '),

			async ({page}) => {
				const root = await createInitRouter(engineName, {
					main: {
						path: '/'
					},

					second: {
						// The path should not match the page identifier so that we can test the non-normalized path as an argument
						path: '/second-page',
						content: 'Second page'
					},

					secondAlias: {
						path: '/second/alias',
						alias: 'second'
					}
				})(page, {
					initialRoute: 'main'
				});

				await assertPathTransitionsTo(root, '/second/alias', 'Second page');
				await assertActivePageIs(root, 'second');
				await assertRouteNameIs(root, 'secondAlias');
			}
		);

		test(
			[
				'should switch to the original page using an alias path with the parameters,',
				'but the page URL should have the path of the alias route'
			].join(' '),

			async ({page}) => {
				const root = await createInitRouter(engineName, {
					main: {
						path: '/'
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

					templateAlias: {
						path: '/tpl-alias/:param1/:param2?',
						alias: 'template'
					}
				})(page, {
					initialRoute: 'main'
				});

				await test.expect(root.evaluate(async (ctx) => {
					await ctx.router?.push('/tpl-alias/foo/bar');
					return ctx.route?.params;
				})).resolves.toEqual({param1: 'foo', param2: 'bar'});

				await assertActivePageIs(root, 'template');

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

			async ({page}) => {
				const root = await createInitRouter(engineName, {
					main: {
						path: '/',
						content: 'Main page'
					},

					aliasToRedirect: {
						path: '/second/alias-redirect',
						alias: 'indexRedirect'
					},

					indexRedirect: {
						path: '/redirect',
						redirect: 'main'
					}
				})(page, {
					initialRoute: 'main'
				});

				await assertPathTransitionsTo(root, '/second/alias-redirect', 'Main page');
				await assertActivePageIs(root, 'main');
				await assertRouteNameIs(root, 'aliasToRedirect');
			}
		);

		test(
			'should switch to the original page using the chained aliases',

			async ({page}) => {
				const root = await createInitRouter(engineName, {
					main: {
						path: '/',
						content: 'Main page'
					},

					second: {
						path: '/second',
						content: 'Second page'
					},

					secondAlias: {
						path: '/second/alias',
						alias: 'second'
					},

					aliasToAlias: {
						path: '/alias-to-alias',
						alias: 'secondAlias'
					}
				})(page, {
					initialRoute: 'main'
				});

				await assertPathTransitionsTo(root, '/alias-to-alias', 'Second page');
				await assertActivePageIs(root, 'second');
				await assertRouteNameIs(root, 'aliasToAlias');
			}
		);

		test(
			'should redirect to the page using the redirect path without parameters',

			async ({page}) => {
				const root = await createInitRouter(engineName, {
					main: {
						path: '/',
						content: 'Main page'
					},

					second: {
						path: '/second',
						content: 'Second page'
					},

					secondRedirect: {
						path: '/second/redirect',
						redirect: 'second'
					}
				})(page, {
					initialRoute: 'main'
				});

				await assertPathTransitionsTo(root, '/second/redirect', 'Second page');
				await assertActivePageIs(root, 'second');
				await assertRouteNameIs(root, 'second');
			}
		);

		test(
			'should redirect to the page using the redirect path with parameters',

			async ({page}) => {
				const root = await createInitRouter(engineName, {
					main: {
						path: '/',
						content: 'Main page'
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

					redirectTemplate: {
						path: '/tpl/redirect/:param1/:param2',
						redirect: 'template'
					}
				})(page, {
					initialRoute: 'main'
				});

				await test.expect(root.evaluate(async (ctx) => {
					await ctx.router?.push('/tpl/redirect/1/2');
					return ctx.route?.params;
				})).resolves.toEqual({param1: '1', param2: '2'});

				await assertActivePageIs(root, 'template');

				// eslint-disable-next-line playwright/no-conditional-in-test
				if (engineName === 'history') {
					test.expect(new URL(page.url()).pathname).toBe('/tpl/1/2');
				}
			}
		);

		test(
			'should redirect to the page using an alias path with the redirect',

			async ({page}) => {
				const root = await createInitRouter(engineName, {
					main: {
						path: '/',
						content: 'Main page'
					},

					second: {
						path: '/second',
						content: 'Second page'
					},

					secondAlias: {
						path: '/second/alias',
						alias: 'second'
					},

					redirectToAlias: {
						path: '/redirect-alias',
						redirect: 'secondAlias'
					}
				})(page, {
					initialRoute: 'main'
				});

				await assertPathTransitionsTo(root, '/redirect-alias', 'Second page');
				await assertActivePageIs(root, 'second');
				await assertRouteNameIs(root, 'secondAlias');
			}
		);

		test(
			'should redirect to the page using the chained redirect',

			async ({page}) => {
				const root = await createInitRouter(engineName, {
					main: {
						path: '/',
						content: 'Main page'
					},

					second: {
						path: '/second',
						content: 'Second page'
					},

					secondRedirect: {
						path: '/second/redirect',
						redirect: 'second'
					},

					redirectToRedirect: {
						path: '/redirect-redirect',
						redirect: 'secondRedirect'
					}
				})(page, {
					initialRoute: 'main'
				});

				await assertPathTransitionsTo(root, '/redirect-redirect', 'Second page');
				await assertActivePageIs(root, 'second');
				await assertRouteNameIs(root, 'second');
			}
		);

		test(
			[
				'`back` and `forward` methods',
				'should navigate back and forth between one page and another'
			].join(' '),

			async ({page}) => {
				const root = await createInitRouter(engineName, {
					main: {
						path: '/',
						content: 'Main page'
					},

					second: {
						path: '/second',
						content: 'Second page'
					}
				})(page);

				await assertPathTransitionsTo(root, 'main', 'Main page');
				await assertPathTransitionsTo(root, 'second', 'Second page');

				await test.expect(root.evaluate(async (ctx) => {
					await ctx.router!.back();
					return ctx.route!.meta.content;
				})).toBeResolvedTo('Main page');

				await test.expect(root.evaluate(async (ctx) => {
					await ctx.router!.forward();
					return ctx.route!.meta.content;
				})).toBeResolvedTo('Second page');
			}
		);

		test(
			'`go` method should navigate back and forth between one page and another',

			async ({page}) => {
				const root = await createInitRouter(engineName, {
					main: {
						path: '/',
						content: 'Main page'
					},

					second: {
						path: '/second',
						content: 'Second page'
					}
				})(page);

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
			}
		);

		test(
			'should transition by setting arbitrary properties on the root component',

			async ({page}) => {
				const root = await createInitRouter(engineName, {
					main: {
						path: '/'
					},

					second: {
						path: '/second',
						query: {
							rootParam: (o) => o.r.rootParam
						}
					}
				})(page, {
					initialRoute: 'main'
				});

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
			}
		);

		async function assertPathTransitionsTo(root: JSHandle<iStaticPage>, path: string, content: string) {
			await test.expect(root.evaluate(async (ctx, path) => {
				await ctx.router!.push(path);
				return ctx.route!.meta.content;
			}, path)).toBeResolvedTo(content);
		}

		async function assertActivePageIs(root: JSHandle<iStaticPage>, routeId: string) {
			await test.expect(root.evaluate(({activePage}) => activePage)).resolves.toEqual(routeId);
		}

		async function assertRouteNameIs(root: JSHandle<iStaticPage>, name: string) {
			await test.expect(root.evaluate(({route}) => route!.name)).toBeResolvedTo(name);
		}
	}
});
