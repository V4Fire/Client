/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import { createInitRouter } from 'components/base/b-router/test/helpers';

test.describe('<b-router> passing transition parameters', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test.describe('transition through paths that include interpolation of values from transition parameters', () => {
		test(
			'parameters from `params` should be passed as values into the transition path where `:paramName` constructs are located',

			async ({page}) => {
				const root = await createInitRouter('history', {
					user: {
						path: '/user/:userId'
					},

					userProfile: {
						path: '/user/:userId/profile'
					}
				})(page);

				await test.expect(root.evaluate(async (ctx) => {
					const
						router = ctx.router!,
						transitions: Dictionary = {};

					await router.push('user', {params: {userId: '42'}});
					transitions.user = location.pathname;

					await router.push('userProfile', {params: {userId: '42'}});
					transitions.userProfile = location.pathname;

					return transitions;

				})).resolves.toEqual({
					user: '/user/42',
					userProfile: '/user/42/profile'
				});
			}
		);

		test(
			'if path parameters are not passed along with the transition, the transition to this path will not be made',

			async ({page}) => {
				const root = await createInitRouter('history', {
					user: {
						path: '/user/:userId'
					}
				})(page);

				const transition = root.evaluate(
					(ctx) => ctx.router!.push('user').catch((err) => err.toString())
				);

				await test.expect(transition).resolves.toBe('TypeError: Expected "userId" to be a string');
			}
		);

		test(
			'if a parameter in the path has a `?` symbol at the end during interpolation, it should be optional',

			async ({page}) => {
				const root = await createInitRouter('history', {
					direct: {
						path: '/user/:userId/direct/:conversationId?'
					}
				})(page);

				await test.expect(root.evaluate(async (ctx) => {
					const
						router = ctx.router!,
						transitions: Dictionary = {};

					await router.push('direct', {params: {userId: 42}});
					transitions.direct = location.pathname;

					await router.push('direct', {params: {userId: 42, conversationId: 15}});
					transitions.conversation = location.pathname;

					return transitions;

				})).resolves.toEqual({
					direct: '/user/42/direct',
					conversation: '/user/42/direct/15'
				});
			}
		);

		test(
			'by default, parameters for path interpolation can be taken not only from params, but also from query',

			async ({page}) => {
				const root = await createInitRouter('history', {
					direct: {
						path: '/user/:userId/direct/:conversationId'
					}
				})(page);

				await test.expect(root.evaluate(async (ctx) => {
					await ctx.router!.push('direct', {params: {userId: 42}, query: {conversationId: 15, utm: 'portal'}});
					return location.pathname + location.search;

				})).resolves.toBe('/user/42/direct/15?utm=portal');
			}
		);

		test(
			"if the route's `paramsFromQuery` option is set to false, the parameters for interpolation should only be taken from `params`",

			async ({page}) => {
				const root = await createInitRouter('history', {
					direct: {
						path: '/user/:userId/direct/:conversationId?',
						paramsFromQuery: false
					}
				})(page);

				await test.expect(root.evaluate(async (ctx) => {
					await ctx.router!.push('direct', {params: {userId: 42}, query: {conversationId: 15, utm: 'portal'}});
					return location.pathname + location.search;

				})).resolves.toBe('/user/42/direct?conversationId=15&utm=portal');
			}
		);

		test('support for aliases for interpolation parameters', async ({page}) => {
			const root = await createInitRouter('history', {
				tpl: {
					path: '/tpl/:param1/:param2?',
					pathOpts: {
						aliases: {
							param1: ['_param1', 'Param1'],
							param2: ['Param2']
						}
					}
				}
			})(page);

			await test.expect(root.evaluate(async (ctx) => {
				const
					router = ctx.router!,
					transitions: Dictionary = {};

				await router.push('tpl', {params: {param1: 'foo'}});
				transitions.path1 = getPath();

				await router.push('tpl', {params: {param1: 'foo', _param1: 'bar'}});
				transitions.path2 = getPath();

				await router.push('tpl', {params: {Param1: 'foo'}});
				transitions.path3 = getPath();

				await router.push('tpl', {params: {Param1: 'bar', _param1: 'foo'}});
				transitions.path4 = getPath();

				await router.push('tpl', {params: {_param1: 'foo'}, query: {Param1: 'bla', Param2: 'bar'}});
				transitions.path5 = getPath();

				return transitions;

				function getPath() {
					return location.pathname + location.search;
				}

			})).resolves.toEqual({
				path1: '/tpl/foo',
				path2: '/tpl/foo',
				path3: '/tpl/foo',
				path4: '/tpl/foo',
				path5: '/tpl/foo/bar?Param1=bla'
			});
		});
	});

	test('should stay on the current route and merge params when route is null', async ({page}) => {
		const root = await createInitRouter('history', {
			main: {
				path: '/main'
			}
		})(page);

		await test.expect(root.evaluate(async (ctx) => {
			const
				router = ctx.router!,
				transitions: Dictionary = {};

			await router.push('main', {query: {foo: 1}});
			transitions.path1 = getPath();

			await router.push(null, {query: {baz: 1}});
			transitions.path2 = getPath();

			await router.push(null, {query: {bar: 2}});
			transitions.path3 = getPath();

			await router.push(null, {query: {bar: null}});
			transitions.path4 = getPath();

			return transitions;

			function getPath() {
				return location.pathname + location.search;
			}

		})).resolves.toEqual({
			path1: '/main?foo=1',
			path2: '/main?baz=1&foo=1',
			path3: '/main?bar=2&baz=1&foo=1',
			path4: '/main?baz=1&foo=1'
		});
	});

	test('should navigate to the specified route and replace params when route is a string', async ({page}) => {
		const root = await createInitRouter('history', {
			main: {
				path: '/main'
			}
		})(page);

		await test.expect(root.evaluate(async (ctx) => {
			const
				router = ctx.router!,
				transitions: Dictionary = {};

			await router.push('main', {query: {foo: 1}});
			transitions.path1 = getPath();

			await router.push('main', {query: {baz: 1}});
			transitions.path2 = getPath();

			await router.push('main', {query: {}});
			transitions.path3 = getPath();

			return transitions;

			function getPath() {
				return location.pathname + location.search;
			}

		})).resolves.toEqual({
			path1: '/main?foo=1',
			path2: '/main?baz=1',
			path3: '/main'
		});
	});

	test('shouldn\'t merge params, when navigating through history', async ({page}) => {
		const root = await createInitRouter('history', {
			main: {
				path: '/main'
			}
		})(page);

		await test.expect(root.evaluate(async (ctx) => {
			const
				router = ctx.router!,
				transitions: Dictionary = {};

			await router.push('main', {query: {foo: 1}});
			transitions.path1 = getPath();

			await router.push(null, {query: {baz: 1}});
			transitions.path2 = getPath();

			await router.push('main', {query: {baz: 2}});
			transitions.path3 = getPath();

			await router.back();
			transitions.path4 = getPath();

			await router.back();
			transitions.path5 = getPath();

			await router.forward();
			transitions.path6 = getPath();

			return transitions;

			function getPath() {
				return location.pathname + location.search;
			}

		})).resolves.toEqual({
			path1: '/main?foo=1',
			path2: '/main?baz=1&foo=1',
			path3: '/main?baz=2',
			path4: '/main?baz=1&foo=1',
			path5: '/main?foo=1',
			path6: '/main?baz=1&foo=1'
		});
	});
});
