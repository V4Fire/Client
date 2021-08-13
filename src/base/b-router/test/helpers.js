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
	h = include('tests/helpers');

/**
 * Initializes a router
 *
 * @param {Page} page
 * @param {'historyApiRouterEngine'|'inMemoryRouterEngine'} [engineName='historyApiRouterEngine']
 * @param {string|undefined|null} [initialRoute]- Pass `null` to remove initialRoute for the in-memory engine
 *
 * @returns {!Promise<Playwright.JSHandle>}
 */
async function initRouter(page, engineName = 'historyApiRouterEngine', initialRoute = undefined) {
	await (await h.component.getRoot(page)).evaluate((ctx) => ctx.router?.clear());

	if (initialRoute === undefined && engineName === 'inMemoryRouterEngine') {
		initialRoute = 'main';
	}

	await page.evaluate(([engineName, initialRoute]) => {
		globalThis.removeCreatedComponents();

		const
			bDummyComponent = document.querySelector('.b-dummy').component,
			engine = bDummyComponent.engines.router[engineName];

		const scheme = [
			{
				attrs: {
					id: 'target',

					engine,
					initialRoute: initialRoute ?? undefined,

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
							path: '/tpl/:param1/:param2?'
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
	}, [engineName, initialRoute]);

	await h.component.waitForComponent(page, '#target');
	return h.component.getRoot(page);
}

module.exports = {
	initRouter
};
