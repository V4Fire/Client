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
 * Initializes an input to test
 *
 * @param {Page} page
 * @param {Object=} attrs
 * @returns {!Promise<CanUndef<Playwright.JSHandle>>}
 */
async function initInput(page, attrs = {}) {
	await page.evaluate((attrs) => {
		const scheme = [
			{
				attrs: {
					'data-id': 'target',
					...attrs,

					// eslint-disable-next-line no-new-func
					regExps: /return /.test(attrs.regExps) ? Function(attrs.regExps)() : attrs.regExps
				}
			}
		];

		globalThis.renderComponents('b-dummy-text-functional', scheme);
	}, attrs);

	return h.component.waitForComponent(page, '[data-id="target"]');
}

module.exports = {
	initInput
};
