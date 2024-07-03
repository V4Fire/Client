/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';

import test from 'tests/config/unit/test';

import { createInitRouter, assertPathTransitionsTo } from 'components/base/b-router/test/helpers';
import type { EngineName } from 'components/base/b-router/test/interface';

import type iStaticPage from 'components/super/i-static-page/i-static-page';

import type { TransitionOptions } from 'core/router';

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
			'the router should switch to the default page if the specified route could not be found',

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
				'the router should switch to the original page, using an alias path.',
				'However, the route name must match the name of the alias route'
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
				'the router should switch to the original page using an alias path with parameters,',
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
				'the router should redirect to the main page using an alias path,',
				'that points to a redirect route which in turn redirects to the main page'
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
			'the router should switch to the original page using a chain of aliases',

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
			'the router should redirect to the page using a redirect path without parameters',

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
			'the router should redirect to the page using a redirect path with parameters',

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
			'the router should redirect to the page using an alias path with the redirect',

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
			'the router should redirect to the page using a chained redirect',

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
			'the `back` and `forward` methods should navigate back and forth between pages',

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
			'the `go` method should navigate back and forth between pages',

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
			'the router should be able to handle query params that are specified as functions',

			async ({page}) => {
				const root = await createInitRouter(engineName, {
					main: {
						path: '/'
					},

					second: {
						path: '/second',
						query: {
							// The argument is an instance of the router, `r` is a link to the root component
							rootParam: (o) => o.r.rootParam
						}
					}
				})(page, {
					initialRoute: 'main'
				});

				const transition = root.evaluate(async (ctx) => {
					ctx['rootParam'] = 1;

					await ctx.router!.push('second');

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

		test(
			'the router should change the route according to last `push()` call during a series of subsequent calls',

			async ({page}) => {
				const root = await createInitRouter(engineName, {
					main: {
						path: '/'
					},

					second: {
						path: '/second'
					},

					third: {
						path: '/third'
					},

					forth: {
						path: '/forth'
					}
				})(page, {
					initialRoute: 'main'
				});

				const transition = root.evaluate((ctx) => {
					void ctx.router!.push('second');
					void ctx.router!.push('third');
					void ctx.router!.push('forth');

					return ctx.route?.name;
				});

				await test.expect(transition).resolves.toEqual('forth');
			}
		);

		for (const paramKind of <Array<keyof TransitionOptions>>['param', 'query']) {

			test.describe(
				[
					`the router should only update keys listed in "${paramKind}" dictionary`,
					'in a series of subsequent `.replace(null, ...)` calls'
				].join(' '),

				() => {

					let root: JSHandle<iStaticPage>;

					test.beforeEach(async ({page}) => {
						root = await createInitRouter(engineName, {
							main: {
								path: '/',
								[paramKind]: {
									doNotTouch: 1,
									mayChange: 1,
									mayChangeToo: 1
								}
							}
						})(page, {
							initialRoute: 'main'
						});
					});

					test('if an existing parameter is changed', async () => {
						await testReplaceSequenceTransition(
							paramKind,
							[
								{mayChange: 2},
								{mayChangeToo: 2}
							],

							{
								doNotTouch: 1,
								mayChange: 2,
								mayChangeToo: 2
							}
						);
					});

					test('if a new parameter is added', async () => {
						await testReplaceSequenceTransition(
							paramKind,
							[
								{firstNewParam: 1},
								{secondNewParam: 1}
							],

							{
								doNotTouch: 1,
								mayChange: 1,
								mayChangeToo: 1,
								firstNewParam: 1,
								secondNewParam: 1
							}
						);
					});

					/**
					 * Performs a test of a transition caused by a sequence of not-awaited `replace()` calls.
					 * Returns a Promise.
					 *
					 * @param paramKind - the kind of param to test, must be one of 'query' or 'params'
					 * @param optsForCalls - an array of options, each element corresponds to one `replace()` call
					 * @param expectedResult - a dictionary representing the expected value of ctx.route.[paramKind]
					 * after the transition
					 */
					async function testReplaceSequenceTransition(
						paramKind: keyof TransitionOptions,
						optsForCalls: Dictionary[],
						expectedResult: Dictionary
					): Promise<void> {
						const transition = root.evaluate((ctx, [paramKind, optsForCalls]) => {
							const promise = new Promise((resolve) => {
								ctx.router!.on('change', () => {
									if (ctx.route?.[paramKind] == null) {
										return;
									}

									resolve(ctx.route[paramKind]);
								});
							});

							for (const opts of optsForCalls) {
								void ctx.router!.replace(null, {[paramKind]: opts});
							}

							return promise;
						}, <[string, Dictionary[]]>[paramKind, optsForCalls]);

						await test.expect(transition).resolves.toEqual(expectedResult);
					}
				}
			);

		}

		/**
		 * Checks whether the name of the active route page matches the assertion.
		 * The function returns a Promise.
		 *
		 * @param root
		 * @param routeId
		 */
		async function assertActivePageIs(root: JSHandle<iStaticPage>, routeId: string): Promise<void> {
			await test.expect(root.evaluate(({activePage}) => activePage)).resolves.toEqual(routeId);
		}

		/**
		 * Checks whether the route name matches the assertion.
		 * The function returns a Promise.
		 *
		 * @param root
		 * @param name
		 */
		async function assertRouteNameIs(root: JSHandle<iStaticPage>, name: string): Promise<void> {
			await test.expect(root.evaluate(({route}) => route!.name)).toBeResolvedTo(name);
		}
	}
});
