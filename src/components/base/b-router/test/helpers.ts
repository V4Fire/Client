/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { Component, Utils } from 'tests/helpers';

import type { EngineName, InitRouter } from 'components/base/b-router/test/interface';

import type { Router } from 'components/base/b-router/interface';

/**
 * Returns a function to initialize the router on the page with the specified engine
 * @param engineName
 */
export function createInitRouter(engineName: EngineName): InitRouter {
	return async (page, initOptions = {}) => {

		if (initOptions.initialRoute === undefined && engineName === 'in-memory') {
			initOptions.initialRoute = 'main';
		}

		let engine: (() => Router) | undefined;

		switch (engineName) {
			case 'history':
				engine = Utils.evalInBrowser(() => globalThis.importModule('./src/core/router/engines/browser-history.ts').default);
				break;
			case 'in-memory':
				engine = Utils.evalInBrowser(() => globalThis.importModule('./src/core/router/engines/in-memory.ts').default);
				break;
			default:
				// Do nothing
		}

		await Component.createComponent(page, 'b-router', {
			id: 'target',

			engine,
			initialRoute: initOptions.initialRoute ?? undefined,

			routes: {
				main: {
					path: '/',
					content: 'Main page'
				},

				second: {
					// Path should not match with the page id so that we can test non-normalized path as an argument
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
			}
		});

		return Component.waitForRoot(page);
	};
}
