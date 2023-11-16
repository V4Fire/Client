/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page } from 'playwright';

import test from 'tests/config/unit/test';

import { createInitRouter } from 'components/base/b-router/test/helpers';

test.describe('<b-router> passing transition parameters', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test.describe('transition through paths, including interpolation of values from transition parameters', () => {
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

				await root.evaluate((ctx) => ctx.router!.push('user', {params: {userId: '42'}}));
				await test.expect(page.evaluate(() => location.pathname)).toBeResolvedTo('/user/42');

				await root.evaluate((ctx) => ctx.router!.push('userProfile', {params: {userId: '42'}}));
				await test.expect(page.evaluate(() => location.pathname)).toBeResolvedTo('/user/42/profile');
			}
		);

		test(
			'if the path parameters are not included in the transition, the transition will not take place',

			async ({page}) => {
				const root = await createInitRouter('history', {
					user: {
						path: '/user/:userId'
					}
				})(page);

				const transition = root.evaluate(
					(ctx) => ctx.router!.push('user').catch((err) => err.toString())
				);

				await test.expect(transition).toBeResolvedTo('TypeError: Expected "userId" to be a string');
			}
		);

		test(
			'if a parameter in the path ends with a `?` symbol, it should be optional',

			async ({page}) => {
				const root = await createInitRouter('history', {
					direct: {
						path: '/user/:userId/direct/:conversationId?'
					}
				})(page);

				await root.evaluate((ctx) => ctx.router!.push('direct', {params: {userId: 42}}));
				await test.expect(page.evaluate(() => location.pathname)).toBeResolvedTo('/user/42/direct');

				await root.evaluate((ctx) => ctx.router!.push('direct', {params: {userId: 42, conversationId: 15}}));
				await test.expect(page.evaluate(() => location.pathname)).toBeResolvedTo('/user/42/direct/15');
			}
		);

		test(
			'the router should be able to parse parameters from an href with query parameters',

			async ({page}) => {
				const root = await createInitRouter('history', {
					user: {
						path: '/user/:userId?'
					}
				})(page);

				await root.evaluate(async (ctx) => ctx.router!.push('/user/42?from=testFrom'));

				await assertPathWithQueryIs(page, '/user/42?from=testFrom');
			}
		);

		test(
			'by default, path interpolation parameters can be taken not only from params, but also from the query',

			async ({page}) => {
				const root = await createInitRouter('history', {
					direct: {
						path: '/user/:userId/direct/:conversationId'
					}
				})(page);

				await root.evaluate(async (ctx) =>
					ctx.router!.push('direct', {params: {userId: 42}, query: {conversationId: 15, utm: 'portal'}}));

				await assertPathWithQueryIs(page, '/user/42/direct/15?utm=portal');
			}
		);

		test(
			'if the route\'s `paramsFromQuery` option is set to `false`, interpolation parameters should be taken only from the `params`',

			async ({page}) => {
				const root = await createInitRouter('history', {
					direct: {
						path: '/user/:userId/direct/:conversationId?',
						paramsFromQuery: false
					}
				})(page);

				await root.evaluate(async (ctx) =>
					ctx.router!.push('direct', {params: {userId: 42}, query: {conversationId: 15, utm: 'portal'}}));

				await assertPathWithQueryIs(page, '/user/42/direct?conversationId=15&utm=portal');
			}
		);

		test(
			'the router should support aliases for interpolation parameters',

			async ({page}) => {
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

				await root.evaluate((ctx) => ctx.router!.push('tpl', {params: {param1: 'foo'}}));
				await assertPathWithQueryIs(page, '/tpl/foo');

				await root.evaluate((ctx) => ctx.router!.push('tpl', {params: {param1: 'foo', _param1: 'bar'}}));
				await assertPathWithQueryIs(page, '/tpl/foo');

				await root.evaluate((ctx) => ctx.router!.push('tpl', {params: {Param1: 'foo'}}));
				await assertPathWithQueryIs(page, '/tpl/foo');

				await root.evaluate((ctx) => ctx.router!.push('tpl', {params: {Param1: 'bar', _param1: 'foo'}}));
				await assertPathWithQueryIs(page, '/tpl/foo');

				await root.evaluate((ctx) => ctx.router!.push('tpl', {params: {_param1: 'foo'}, query: {Param1: 'bla', Param2: 'bar'}}));
				await assertPathWithQueryIs(page, '/tpl/foo/bar?Param1=bla');
			}
		);
	});

	test.describe('passing parameters to a route with the same name as the current one', () => {
		test(
			'if the route name is set to `null`, new parameters should be merged with the existing ones',

			async ({page}) => {
				const root = await createInitRouter('history', {
					main: {
						path: '/'
					}
				})(page);

				await root.evaluate((ctx) => ctx.router!.push('main', {query: {foo: 1}}));
				await assertPathWithQueryIs(page, '/?foo=1');

				await root.evaluate((ctx) => ctx.router!.push(null, {query: {baz: 1}}));
				await assertPathWithQueryIs(page, '/?baz=1&foo=1');

				await root.evaluate((ctx) => ctx.router!.push(null, {query: {bar: 2}}));
				await assertPathWithQueryIs(page, '/?bar=2&baz=1&foo=1');

				await root.evaluate((ctx) => ctx.router!.push(null, {query: {bar: null}}));
				await assertPathWithQueryIs(page, '/?baz=1&foo=1');
			}
		);

		test(
			[
				'if the route name is explicitly specified as a string,',
				'then the new parameters should entirely replace the existing ones'
			].join(' '),

			async ({page}) => {
				const root = await createInitRouter('history', {
					main: {
						path: '/'
					},

					second: {
						path: '/second-page'
					}
				})(page);

				await root.evaluate((ctx) => ctx.router!.push('main', {query: {foo: 1}}));
				await assertPathWithQueryIs(page, '/?foo=1');

				await root.evaluate((ctx) => ctx.router!.push('main', {query: {baz: 1}}));
				await assertPathWithQueryIs(page, '/?baz=1');

				await root.evaluate((ctx) => ctx.router!.push('second', {query: {bar: 1}}));
				await assertPathWithQueryIs(page, '/second-page?bar=1');

				await root.evaluate((ctx) => ctx.router!.push('second', {query: {}}));
				await assertPathWithQueryIs(page, '/second-page');
			}
		);

		test(
			'parameters should not merge if navigation occurs through history',

			async ({page}) => {
				const root = await createInitRouter('history', {
					main: {
						path: '/'
					}
				})(page);

				await root.evaluate((ctx) => ctx.router!.push('main', {query: {foo: 1}}));
				await assertPathWithQueryIs(page, '/?foo=1');

				await root.evaluate((ctx) => ctx.router!.push(null, {query: {baz: 1}}));
				await assertPathWithQueryIs(page, '/?baz=1&foo=1');

				await root.evaluate((ctx) => ctx.router!.push('main', {query: {baz: 2}}));
				await assertPathWithQueryIs(page, '/?baz=2');

				await root.evaluate((ctx) => ctx.router!.back());
				await assertPathWithQueryIs(page, '/?baz=1&foo=1');

				await root.evaluate((ctx) => ctx.router!.back());
				await assertPathWithQueryIs(page, '/?foo=1');

				await root.evaluate((ctx) => ctx.router!.forward());
				await assertPathWithQueryIs(page, '/?baz=1&foo=1');
			}
		);
	});

	/**
	 * Checks whether the location pathname with query params matches the assertion.
	 * The function returns a Promise.
	 *
	 * @param page
	 * @param assertion
	 */
	async function assertPathWithQueryIs(page: Page, assertion: string): Promise<void> {
		await test.expect(page.evaluate(() => location.pathname + location.search)).toBeResolvedTo(assertion);
	}
});
