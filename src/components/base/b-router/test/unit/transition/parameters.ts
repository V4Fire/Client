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

				await root.evaluate((ctx) => ctx.router!.push('user', {params: {userId: '42'}}));
				await test.expect(page.evaluate(() => location.pathname)).toBeResolvedTo('/user/42');

				await root.evaluate((ctx) => ctx.router!.push('userProfile', {params: {userId: '42'}}));
				await test.expect(page.evaluate(() => location.pathname)).toBeResolvedTo('/user/42/profile');
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

				await test.expect(transition).toBeResolvedTo('TypeError: Expected "userId" to be a string');
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

				await root.evaluate((ctx) => ctx.router!.push('direct', {params: {userId: 42}}));
				await test.expect(page.evaluate(() => location.pathname)).toBeResolvedTo('/user/42/direct');

				await root.evaluate((ctx) => ctx.router!.push('direct', {params: {userId: 42, conversationId: 15}}));
				await test.expect(page.evaluate(() => location.pathname)).toBeResolvedTo('/user/42/direct/15');
			}
		);

		test(
			'correctly parses parameters in href with query parameters',

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
			'by default, parameters for path interpolation can be taken not only from params, but also from query',

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
			"if the route's `paramsFromQuery` option is set to false, the parameters for interpolation should only be taken from `params`",

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
			'support for aliases for interpolation parameters',

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
			'if the route name is set to null, then the new parameters should be merged with the old ones',

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
				'if the route name is explicitly set as a string,',
				'then the new parameters should completely replace the old ones'
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
			'parameters should never be merged if we are navigating through the history',

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
