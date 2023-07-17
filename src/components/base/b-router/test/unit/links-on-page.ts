/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';
import { Component } from 'tests/helpers';

import { createInitRouter } from 'components/base/b-router/test/helpers';

test.describe('<b-router> intercepting links on a page', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test(
		'by default, clicks on any relative links on the page should be intercepted by the router',

		async ({page}) => {
			const root = await createInitRouter('history', {
				second: {
					path: '/second'
				}
			})(page);

			await Component.createComponent(page, 'a', {
				'data-testid': 'target',
				href: '/second',
				text: 'Go'
			});

			await page.getByTestId('target').click();
			await test.expect(root.evaluate((ctx) => ctx.route?.name)).resolves.toBe('second');
		}
	);

	test(
		'clicks on links should not be intercepted if the router is initialized with the prop `interceptLinks` set to false',

		async ({page}) => {
			const root = await createInitRouter('history', {
				second: {
					path: '/second'
				}
			}, {interceptLinks: false})(page);

			await Component.createComponent(page, 'a', {
				'data-testid': 'target',
				href: '/second',
				text: 'Go'
			});

			await page.getByTestId('target').click();

			await test.expect(
				root.evaluate((ctx) => ctx.route?.name).catch((err) => err.message)
			).resolves.toBe('jsHandle.evaluate: Execution context was destroyed, most likely because of a navigation');
		}
	);

	test(
		'query parameters in the link should be passed to the transition',

		async ({page}) => {
			const root = await createInitRouter('history', {
				second: {
					path: '/second'
				}
			})(page);

			await Component.createComponent(page, 'a', {
				'data-testid': 'target',
				href: '/second?foo=bar&baz=bla',
				text: 'Go'
			});

			await page.getByTestId('target').click();

			await test.expect(root.evaluate((ctx) => ctx.route?.query)).resolves.toEqual({
				foo: 'bar',
				baz: 'bla'
			});
		}
	);

	test(
		'the `data-router-method` attribute should set the method of transition used by the router',

		async ({page}) => {
			const root = await createInitRouter('history', {
				main: {
					path: '/'
				},

				second: {
					path: '/second'
				}
			})(page);

			await Component.createComponent(page, 'a', {
				'data-testid': 'target',
				href: '/second',
				text: 'Go',
				'data-router-method': 'replace'
			});

			await root.evaluate((ctx) => ctx.router?.push('main'));

			await page.getByTestId('target').click();
			await test.expect(root.evaluate((ctx) => ctx.route?.name)).resolves.toBe('second');

			await root.evaluate((ctx) => ctx.router?.back());
			await test.expect(root.evaluate((ctx) => ctx.route?.name)).resolves.toBe('notFound');
		}
	);

	test(
		'the `data-router-go` attribute should set the parameters for the transition using the `router.go` method',

		async ({page}) => {
			const root = await createInitRouter('history', {
				main: {
					path: '/'
				},

				second: {
					path: '/second'
				}
			})(page);

			await Component.createComponent(page, 'a', {
				'data-testid': 'target',
				href: '/second',
				text: 'Go',
				'data-router-method': 'go',
				'data-router-go': '-1'
			});

			await root.evaluate(async (ctx) => {
				await ctx.router?.push('main');
				await ctx.router?.push('second');
			});

			await page.getByTestId('target').click();
			await test.expect(root.evaluate((ctx) => ctx.route?.name)).resolves.toBe('main');
		}
	);

	test(
		'the `data-router-query` attribute should set the query parameters for the transition',

		async ({page}) => {
			const root = await createInitRouter('history', {
				second: {
					path: '/second'
				}
			})(page);

			await Component.createComponent(page, 'a', {
				'data-testid': 'target',
				href: '/second',
				text: 'Go',
				'data-router-query': JSON.stringify({foo: 'bar'})
			});

			await page.getByTestId('target').click();
			await test.expect(root.evaluate((ctx) => ctx.route?.query)).resolves.toEqual({
				foo: 'bar'
			});
		}
	);

	test(
		'the query parameters passed through the URL link and the `data-router-query` attribute should be merged together',

		async ({page}) => {
			const root = await createInitRouter('history', {
				second: {
					path: '/second'
				}
			})(page);

			await Component.createComponent(page, 'a', {
				'data-testid': 'target',
				href: '/second?a=1&b=2',
				text: 'Go',
				'data-router-query': JSON.stringify({a: 3, c: 4})
			});

			await page.getByTestId('target').click();
			await test.expect(root.evaluate((ctx) => ctx.route?.query)).resolves.toEqual({
				a: 3,
				b: 2,
				c: 4
			});
		}
	);

	test(
		'the `data-router-params` attribute should set the path parameters for the transition',

		async ({page}) => {
			await createInitRouter('history', {
				user: {
					path: '/user/:userId'
				}
			})(page);

			await Component.createComponent(page, 'a', {
				'data-testid': 'target',
				href: 'user',
				text: 'Go',
				'data-router-params': JSON.stringify({userId: 42})
			});

			await page.getByTestId('target').click();
			test.expect(new URL(await page.url()).pathname).toBe('/user/42');
		}
	);

	test(
		'the `data-router-meta` attribute should set the meta parameters for the transition',

		async ({page}) => {
			const root = await createInitRouter('history', {
				second: {
					path: '/second'
				}
			})(page);

			await Component.createComponent(page, 'a', {
				'data-testid': 'target',
				href: '/second',
				text: 'Go',
				'data-router-meta': JSON.stringify({foo: 'bar'})
			});

			await page.getByTestId('target').click();
			await test.expect(root.evaluate((ctx) => ctx.route?.meta)).resolves.toEqual({
				foo: 'bar',
				default: false,
				external: false,
				name: 'second',
				path: '/second'
			});
		}
	);
});
