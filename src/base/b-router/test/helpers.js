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
 * @returns {!Promise<Playwright.JSHandle>}
 */
async function initRouter(page) {
	await page.evaluate(() => {
		globalThis.removeCreatedComponents();

		const scheme = [
			{
				attrs: {
					id: 'target',

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
	});

	await h.component.waitForComponent(page, '#target');
	return h.component.waitForComponent(page, '#root-component');
}

module.exports = {
	initRouter
};
