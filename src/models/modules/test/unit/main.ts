/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import test from 'tests/config/unit/test';
import { Utils, Component } from 'tests/helpers';

import type * as Session from 'core/session';

import type APIMockOptions from 'models/modules/test/interface';

test.describe('models/modules/session', () => {
	let
		sessionHandlers: JSHandle<typeof Session>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		sessionHandlers = await Utils.import(page, 'core/session');
	});

	test(
		'the module should add an authorization header with a prefix to the request if a session exists',

		async ({page}) => {
			let
				headers: Dictionary<string> = {};

			await sessionHandlers.evaluate(({set}) => set('test-session'));

			const routeHandlePromise = createAPIMock(page, {
				handler: (resolve, route) => {
					headers = route.request().headers();
					resolve();
				},
				status: 200
			});

			await createDummyWithProvider(page);
			await routeHandlePromise;

			test.expect(headers.authorization).toBe('Bearer test-session');
		}
	);

	test(
		'the module should add a CSRF header to the request if the session provides the `csrf` parameter',

		async ({page}) => {
			let
				headers: Dictionary<string> = {};

			await sessionHandlers.evaluate(({set}) => set('test-session', {
				csrf: 'test-csrf'
			}));

			const routeHandlePromise = createAPIMock(page, {
				handler: (resolve, route) => {
					headers = route.request().headers();
					resolve();
				},
				status: 200
			});

			await createDummyWithProvider(page);
			await routeHandlePromise;

			test.expect(headers['x-xsrf-token']).toBe('test-csrf');
		}
	);

	test(
		'the module should not add auth headers if the session does not exist',

		async ({page}) => {
			let
				headers: Dictionary<string> = {};

			const routeHandlePromise = createAPIMock(page, {
				handler: (resolve, route) => {
					headers = route.request().headers();
					resolve();
				},
				status: 200
			});

			await createDummyWithProvider(page);
			await routeHandlePromise;

			test.expect(headers.authorization).toBeUndefined();
			test.expect(headers['x-xsrf-token']).toBeUndefined();
		}
	);

	test(
		'the module should clear the session if the response has a status code of 401',

		async ({page}) => {
			await sessionHandlers.evaluate(({set}) => set('test-session'));

			const routeHandlePromise = createAPIMock(page, {
				handler: (resolve) => resolve(),
				status: 401
			});

			await createDummyWithProvider(page);
			await routeHandlePromise;

			const {auth, params} = await sessionHandlers.evaluate(({get}) => get());

			test.expect(auth).toBeUndefined();
			test.expect(params).toBeUndefined();
		}
	);

	test(
		'the module should repeat a request if the response has a status code of 401',

		async ({page}) => {
			let
				isInitialRequest = true,
				requestCount = 0;

			await sessionHandlers.evaluate(({set}) => set('test-session'));

			const routeHandlePromise = createAPIMock(page, {
				handler: (resolve) => {
					requestCount += 1;

					if (!isInitialRequest) {
						resolve();
					}
				},
				status: () => {
					if (isInitialRequest) {
						isInitialRequest = false;
						return 401;
					}

					return 200;
				}
			});

			await createDummyWithProvider(page);
			await routeHandlePromise;

			test.expect(requestCount).toBe(2);
		}
	);

	test(
		'the module should set up a new session if the response has a status code of 200 and a refresh token is provided',

		async ({page}) => {
			await sessionHandlers.evaluate(({set}) => set('test-session'));

			const routeHandlePromise = createAPIMock(page, {
				handler: (resolve) => resolve(),
				status: 200,
				withRefreshToken: true
			});

			await createDummyWithProvider(page);
			await routeHandlePromise;

			const {auth, params} = await sessionHandlers.evaluate(({get}) => get());

			test.expect(auth).toBe('new-test-session');
			test.expect(params).toEqual({
				csrf: 'new-test-csrf'
			});
		}
	);

	test(
		'the module should set up a new session if the response has a status code of 401 and a refresh token is provided',

		async ({page}) => {
			await sessionHandlers.evaluate(({set}) => set('test-session'));

			const routeHandlePromise = createAPIMock(page, {
				handler: (resolve) => resolve(),
				status: 401,
				withRefreshToken: true
			});

			await createDummyWithProvider(page);
			await routeHandlePromise;

			const {auth, params} = await sessionHandlers.evaluate(({get}) => get());

			test.expect(auth).toBe('new-test-session');
			test.expect(params).toEqual({
				csrf: 'new-test-csrf'
			});
		}
	);

	/**
	 * Creates the `<b-dummy>` component with the `test.Session` data provider.
	 * The function returns the Promise.
	 *
	 * @param page
	 */
	async function createDummyWithProvider(page: Page): Promise<void> {
		await Component.createComponent(
			page,
			'b-dummy',
			{
				attrs: {
					dataProvider: 'test.Session'
				}
			}
		);
	}

	/**
	 * Handles requests to the **\/session URL.
	 * Fulfils the request with the specified status code and headers.
	 * The function returns the Promise.
	 *
	 * @param page
	 * @param opts
	 */
	async function createAPIMock(page: Page, opts: APIMockOptions): Promise<void> {
		return new Promise(async (resolve) => {
			const {handler, status, withRefreshToken = false} = opts;

			await page.route('**/session', async (route) => {
				handler(resolve, route);

				const
					headers: {[H: string]: string} = {
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Headers': '*'
					};

				if (withRefreshToken) {
					Object.assign(headers, {
						'Access-Control-Expose-Headers': '*',
						'X-JWT-TOKEN': 'new-test-session',
						'X-XSRF-TOKEN': 'new-test-csrf'
					});
				}

				return route.fulfill({
					status: Object.isFunction(status) ? status() : status,
					headers
				});
			});
		});
	}
});
