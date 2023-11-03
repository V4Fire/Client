/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';

import test from 'tests/config/unit/test';

import type iStaticPage from 'components/super/i-static-page/i-static-page';

import type { EngineName } from 'components/base/b-router/test/interface';
import { createInitRouter, assertPathTransitionsTo } from 'components/base/b-router/test/helpers';

test.describe('<b-router> simple use-cases', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test.describe('with `history` engine', () => {
		// Common tests
		test.describe('-', () => {
			generateSpecs('history');
		});

		// Specific tests
		test.describe('-', () => {
			const initRouter = createInitRouter('history', {
				main: {
					path: '/',
					content: 'Main page'
				},

				second: {
					path: '/second',
					content: 'Second page'
				}
			});

			let root: JSHandle<iStaticPage>;

			test.beforeEach(async ({page}) => {
				root = await initRouter(page, {
					initialRoute: 'main'
				});
			});

			test.describe('`replace`', () => {
				test(
					'should switch the page and not change the length of the history',

					async () => {
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
					}
				);

				test(
					'should merge the new query parameters with the existing ones if the route name is set to `null`',

					async () => {
						await test.expect(root.evaluate(async (ctx) => {
							const
								historyLength = history.length,
								res: Dictionary = {};

							await ctx.router!.replace('second', {query: {foo: 2}});
							await ctx.router!.replace(null, {query: {bla: 1}});

							res.content = ctx.route!.meta.content;
							res.query = location.search;
							res.lengthDoesntChange = historyLength === history.length;

							return res;

						})).resolves.toEqual({
							query: '?bla=1&foo=2',
							content: 'Second page',
							lengthDoesntChange: true
						});
					}
				);
			});
		});
	});

	test.describe('with `in-memory` engine', () => {
		// Common tests
		test.describe('-', () => {
			generateSpecs('in-memory');
		});

		// Specific tests
		test.describe('-', () => {
			const initRouter = createInitRouter('in-memory', {
				main: {
					path: '/',
					content: 'Main page'
				},

				second: {
					path: '/second',
					content: 'Second page'
				}
			});

			test(
				'the `route` property should be `null` when `initialRoute` is not set',

				async ({page}) => {
					const root = await initRouter(page, {initialRoute: null});
					await test.expect(root.evaluate(({route}) => route == null)).resolves.toBeTruthy();
				}
			);

			test.describe('`replace`', () => {
				test(
					'should switch the page and not change the length of the history',

					async ({page}) => {
						const root = await initRouter(page);

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
					}
				);

				test(
					'should merge the new query parameters with the existing ones if the route name is set to `null`',

					async ({page}) => {
						const root = await initRouter(page);

						await test.expect(root.evaluate(async (ctx) => {
							const
								{router} = ctx;

							const
								historyLength = router!.unsafe.engine.history.length,
								res: Dictionary = {};

							await router!.replace('second', {query: {foo: 2}});
							await router!.replace(null, {query: {bla: 1}});

							res.content = ctx.route!.meta.content;
							res.query = ctx.route!.query;
							res.lengthDoesntChange = historyLength === router!.unsafe.engine.history.length;

							return res;

						})).resolves.toEqual({
							content: 'Second page',
							query: {foo: 2, bla: 1},
							lengthDoesntChange: true
						});
					}
				);
			});
		});
	});
});

/**
 * Generates common specs for all router engines of "simple" runners
 * @param engineName
 */
function generateSpecs(engineName: EngineName) {
	/* eslint-disable playwright/require-top-level-describe */
	const initRouter = createInitRouter(engineName, {
		main: {
			path: '/',
			content: 'Main page'
		},

		second: {
			path: '/second',
			content: 'Second page'
		},

		notFound: {
			default: true
		}
	});

	let root: JSHandle<iStaticPage>;

	test.beforeEach(async ({page}) => {
		root = await initRouter(page);
	});

	test(
		'the `route` property should be set on the root component',

		async () => {
			await test.expect(root.evaluate(({route}) => route != null)).resolves.toBeTruthy();
		}
	);

	test(
		'the root component should have a `root` property in the meta params',

		async () => {
			test.expect(await root.evaluate((ctx) => ctx.unsafe.meta.params.root)).toBe(true);
		}
	);

	test(
		'the root\'s `router` field should be a `b-router` component',

		async () => {
			test.expect(await root.evaluate(({router}) => router?.componentName)).toBe('b-router');
		}
	);

	test.describe('`push`', () => {
		test(
			'should switch the page using a route identifier',

			async () => {
				await assertPathTransitionsTo(root, 'second', 'Second page');
			}
		);

		test(
			'should switch the page using a path',

			async () => {
				await assertPathTransitionsTo(root, '/', 'Main page');
			}
		);
	});

	test(
		'`activePage` property should return the identifier of the active route',

		async () => {
			await test.expect(root.evaluate(async (ctx) => {
				await ctx.router!.push('second');
				return ctx.activePage;
			})).toBeResolvedTo('second');

			await test.expect(root.evaluate(async (ctx) => {
				await ctx.router!.push('main');
				return ctx.activePage;
			})).toBeResolvedTo('main');
		}
	);

	test.describe('`updateRoutes`', () => {
		test(
			'should switch the page to a new default route',

			async () => {
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
					router!.unsafe.routeStore = undefined;

					await router!.unsafe.initRoute('main');
					res.restoredPage = ctx.route!.meta.content;

					return res;

				})).resolves.toEqual({
					dynamicPage: 'Dynamic main page',
					restoredPage: 'Main page'
				});
			}
		);

		test(
			'should update `basePath` and switch the page to the specified `activeRoute`',

			async () => {
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
					router!.unsafe.routeStore = undefined;

					await router!.unsafe.initRoute('/');
					res.restoredPage = ctx.route!.meta.content;

					return res;

				})).resolves.toEqual({
					dynamicPage: 'Dynamic second page',
					restoredPage: 'Main page'
				});
			}
		);
	});

	test(
		'`getRoutePath` should return an URL of the route with a specified `query`',

		async () => {
			await test.expect(root.evaluate(({router}) => router!.getRoutePath('second', {query: {bla: 1}})))
				.toBeResolvedTo('/second?bla=1');

			await test.expect(root.evaluate(({router}) => router!.getRoutePath('/', {query: {bla: 1}})))
				.toBeResolvedTo('/?bla=1');
		}
	);

	test(
		'`getRoute` should return the route descriptor using either a route identifier or a path',

		async () => {
			const pageMeta = {
				name: 'main',
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
		}
	);
}
