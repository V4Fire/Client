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
import type { HrefTransitionEvent } from 'components/base/b-router';

// eslint-disable-next-line max-lines-per-function
test.describe('<b-router> intercepting links on a page', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test(
		'by default, clicks on any relative links on the page should be intercepted by the router',

		async ({page}) => {
			const root = await createInitRouter('history', {
				main: {
					path: '/'
				}
			})(page);

			await Component.createComponent(page, 'a', {
				'data-testid': 'target',
				href: '/',
				text: 'Go'
			});

			await page.getByTestId('target').click();
			await test.expect(root.evaluate((ctx) => ctx.route?.name)).toBeResolvedTo('main');
		}
	);

	test(
		[
			'a click on a link with the `data-router-prevent-transition` attribute',
			'should not be intercepted by the router and the browser'
		].join(' '),

		async ({page}) => {
			const root = await createInitRouter('history', {
				main: {
					path: '/'
				}
			})(page);

			await Component.createComponent(page, 'a', {
				'data-testid': 'target',
				href: '/',
				text: 'Go',
				'data-router-prevent-transition': 'true'
			});

			await page.getByTestId('target').click();
			await test.expect(root.evaluate((ctx) => ctx.route?.name)).resolves.not.toBe('main');
		}
	);

	test(
		'clicking on links should not be intercepted when the router is initialized with `interceptLinks` set to `false`',

		async ({page}) => {
			const root = await createInitRouter('history', {
				main: {
					path: '/'
				}
			}, {interceptLinks: false})(page);

			await Component.createComponent(page, 'a', {
				'data-testid': 'target',
				href: '/',
				text: 'Go'
			});

			await page.getByTestId('target').click();
			await test.expect(
				root.evaluate((ctx) => ctx.route?.name).catch((err) => err.message)
			).toBeResolvedTo('jsHandle.evaluate: Execution context was destroyed, most likely because of a navigation');
		}
	);

	test.describe('links that should not be intercepted by the router but should be intercepted by the browser', () => {
		test(
			'links with absolute URLs',

			async ({page}) => {
				await createInitRouter('history')(page);

				await Component.createComponent(page, 'a', {
					'data-testid': 'target',
					href: 'https://www.google.com',
					text: 'Go'
				});

				await page.getByTestId('target').click();
				test.expect(page.url()).toBe('https://www.google.com/');
			}
		);

		test(
			'anchor links',

			async ({page}) => {
				const root = await createInitRouter('history', {
					main: {
						path: '/'
					}
				})(page, {
					initialRoute: 'main'
				});

				await Component.createComponent(page, 'a', {
					'data-testid': 'target',
					href: '#foo',
					text: 'Go'
				});

				await page.getByTestId('target').click();
				await test.expect(root.evaluate((ctx) => ctx.route?.name)).toBeResolvedTo('main');
				test.expect(new URL(page.url()).hash).toBe('#foo');
			}
		);

		test(
			'`javascript:` links',

			async ({page}) => {
				const root = await createInitRouter('history', {
					main: {
						path: '/'
					}
				})(page, {
					initialRoute: 'main'
				});

				await Component.createComponent(page, 'a', {
					'data-testid': 'target',
					href: 'javascript:void(globalThis.foo = "bar")',
					text: 'Go'
				});

				await page.getByTestId('target').click();
				await test.expect(root.evaluate((ctx) => ctx.route?.name)).toBeResolvedTo('main');
				await test.expect(root.evaluate(() => globalThis.foo)).toBeResolvedTo('bar');
			}
		);

		test(
			'`mailto:` links',

			async ({page}) => {
				const root = await createInitRouter('history', {
					main: {
						path: '/'
					}
				})(page, {
					initialRoute: 'main'
				});

				await Component.createComponent(page, 'a', {
					'data-testid': 'target',
					href: 'mailto:foo@bar.com',
					text: 'Go'
				});

				await page.getByTestId('target').click();
				await test.expect(root.evaluate((ctx) => ctx.route?.name)).toBeResolvedTo('main');
			}
		);

		test(
			'`tel:` links',

			async ({page}) => {
				const root = await createInitRouter('history', {
					main: {
						path: '/'
					}
				})(page, {
					initialRoute: 'main'
				});

				await Component.createComponent(page, 'a', {
					'data-testid': 'target',
					href: 'tel:+71234567890',
					text: 'Go'
				});

				await page.getByTestId('target').click();
				await test.expect(root.evaluate((ctx) => ctx.route?.name)).toBeResolvedTo('main');
			}
		);
	});

	test(
		'the query parameters in the link should be passed to the transition',

		async ({page}) => {
			const root = await createInitRouter('history', {
				main: {
					path: '/'
				}
			})(page);

			await Component.createComponent(page, 'a', {
				'data-testid': 'target',
				href: '/?foo=bar&baz=bla',
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
		'the `data-router-method` attribute should set the transition method used by the router',

		async ({page}) => {
			const root = await createInitRouter('history', {
				main: {
					path: '/'
				},

				second: {
					path: '/second'
				},

				notFound: {
					default: true
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
			await test.expect(root.evaluate((ctx) => ctx.route?.name)).toBeResolvedTo('second');

			await root.evaluate((ctx) => ctx.router?.back());
			await test.expect(root.evaluate((ctx) => ctx.route?.name)).toBeResolvedTo('notFound');
		}
	);

	test(
		'the `data-router-go` attribute should set the transition parameters when using the `router.go` method',

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
			await test.expect(root.evaluate((ctx) => ctx.route?.name)).toBeResolvedTo('main');
		}
	);

	test(
		'the `data-router-query` attribute should set the query parameters for a transition',

		async ({page}) => {
			const root = await createInitRouter('history', {
				main: {
					path: '/'
				}
			})(page);

			await Component.createComponent(page, 'a', {
				'data-testid': 'target',
				href: '/',
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
		[
			'the query parameters passed in through the URL link and',
			'the `data-router-query` attribute should be merged together'
		].join(' '),

		async ({page}) => {
			const root = await createInitRouter('history', {
				main: {
					path: '/'
				}
			})(page);

			await Component.createComponent(page, 'a', {
				'data-testid': 'target',
				href: '/?a=1&b=2',
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
		'the `data-router-params` attribute should set the path parameters for a transition',

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
			test.expect(new URL(page.url()).pathname).toBe('/user/42');
		}
	);

	test(
		'the `data-router-meta` attribute should set the meta parameters for a transition',

		async ({page}) => {
			const root = await createInitRouter('history', {
				main: {
					path: '/'
				}
			})(page);

			await Component.createComponent(page, 'a', {
				'data-testid': 'target',
				href: '/',
				text: 'Go',
				'data-router-meta': JSON.stringify({foo: 'bar'})
			});

			await page.getByTestId('target').click();
			await test.expect(root.evaluate((ctx) => ctx.route?.meta)).resolves.toEqual({
				foo: 'bar',
				default: false,
				external: false,
				name: 'main',
				path: '/'
			});
		}
	);

	test.describe('the router should emit the `hrefTransition` event when a link is clicked', () => {
		test(
			'the event object should contain the information about the link that has been clicked',

			async ({page}) => {
				const root = await createInitRouter('history', {
					user: {
						path: '/user/:userId'
					}
				})(page);

				await Component.createComponent(page, 'a', {
					'data-testid': 'target',

					href: 'user',
					text: 'Go',

					'data-router-method': 'replace',
					'data-router-params': JSON.stringify({userId: 42}),
					'data-router-query': JSON.stringify({type: 'router'}),
					'data-router-meta': JSON.stringify({some: 'data'})
				});

				const transitionDetails = root.evaluate(
					(ctx) => new Promise((resolve) => {
						ctx.router?.on('onHrefTransition', (e: HrefTransitionEvent) => {
							const
								{detail} = e;

							resolve([
								detail.target.tagName,
								detail.href,
								detail.data
							]);
						});
					})
				);

				await page.getByTestId('target').click();

				await test.expect(transitionDetails).resolves.toEqual([
					'A',
					'user',

					{
						method: 'replace',
						params: {userId: 42},
						query: {type: 'router'},
						meta: {some: 'data'}
					}
				]);
			}
		);

		test(
			'calling the `preventDefault` method on the event object should cancel the transition of the router and the browser',

			async ({page}) => {
				const root = await createInitRouter('history', {
					main: {
						path: '/'
					}
				})(page);

				await Component.createComponent(page, 'a', {
					'data-testid': 'target',
					href: '/',
					text: 'Go'
				});

				await root.evaluate((ctx) => ctx.router?.on('onHrefTransition', (e: HrefTransitionEvent) => {
					e.preventDefault();
				}));

				await page.getByTestId('target').click();
				await test.expect(root.evaluate((ctx) => ctx.route?.name)).resolves.not.toBe('main');
			}
		);

		test(
			[
				"calling the `preventRouterTransition` method on the event object should cancel the router's transition,",
				"but not the browser's transition"
			].join(' '),

			async ({page}) => {
				const root = await createInitRouter('history', {
					main: {
						path: '/'
					}
				}, {interceptLinks: false})(page);

				await Component.createComponent(page, 'a', {
					'data-testid': 'target',
					href: '/',
					text: 'Go'
				});

				await root.evaluate((ctx) => ctx.router?.on('onHrefTransition', (e: HrefTransitionEvent) => {
					e.preventRouterTransition();
				}));

				await page.getByTestId('target').click();

				await test.expect(
					root.evaluate((ctx) => ctx.route?.name).catch((err) => err.message)
				).toBeResolvedTo('jsHandle.evaluate: Execution context was destroyed, most likely because of a navigation');
			}
		);
	});
});
