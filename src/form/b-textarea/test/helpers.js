/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

/**
 * @typedef {import('playwright').Page} Page
 */

const
	h = include('tests/helpers');

/**
 * Initializes a textarea to test
 *
 * @param {Page} page
 * @param {Object=} attrs
 * @returns {!Promise<CanUndef<Playwright.JSHandle>>}
 */
async function initTextarea(page, attrs = {}) {
	await page.evaluate((attrs) => {
		Object.forEach(attrs, (el, key) => {
			// eslint-disable-next-line no-new-func
			attrs[key] = /return /.test(el) ? Function(el)() : el;
		});

		const scheme = [
			{
				content: {
					...Object.select(attrs, 'limit')
				},

				attrs: {
					'data-id': 'target',
					...Object.reject(attrs, 'limit'),

					// eslint-disable-next-line no-new-func
					regExps: /return /.test(attrs.regExps) ? Function(attrs.regExps)() : attrs.regExps
				}
			}
		];

		globalThis.renderComponents('b-textarea', scheme);
	}, attrs);

	return h.component.waitForComponent(page, '[data-id="target"]');
}

module.exports = {
	initTextarea
};
