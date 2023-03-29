// @ts-check

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @typedef {import('playwright').Page} Page
 */

const
	h = include('tests/helpers').default;

/**
 * Initializes a router
 *
 * @param {Page} page
 * @param {('historyApiRouterEngine'|'inMemoryRouterEngine')} engineName
 * @param {?Object=} [initOptions] - Router initializing options
 * @param {?string} [initOptions.initialRoute] - Pass `null` to remove `initialRoute` for the in-memory engine
 * @returns {!Promise<Playwright.JSHandle>}
 */
module.exports.initRouter = async function initRouter(page, engineName, initOptions = {}) {
	await (await h.component.getRoot(page)).evaluate((ctx) => ctx.router?.clear());

	if (initOptions.initialRoute === undefined && engineName === 'inMemoryRouterEngine') {
		initOptions.initialRoute = 'main';
	}

	await page.evaluate(([engineName, initOptions]) => {
		globalThis.removeCreatedComponents();

		const
			bDummyComponent = document.querySelector('.b-dummy').component,
			engine = bDummyComponent.engines.router[engineName];

		const scheme = [
			{
				attrs: {
					id: 'target',

					engine,
					initialRoute: initOptions.initialRoute ?? undefined,

					routes: {
						main: {
							path: '/',
							content: 'Main page'
						},

						second: {
							path: '/second',
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

						notFound: {
							default: true,
							content: '404'
						}
					}
				}
			}
		];

		globalThis.renderComponents('b-router', scheme);
	}, [engineName, initOptions]);

	await h.component.waitForComponent(page, '#target');
	return h.component.getRoot(page);
};
