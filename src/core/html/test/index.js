// @ts-check

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	h = include('tests/helpers').default;

/**
 * Starts a test
 *
 * @param {Playwright.Page} page
 * @returns {void}
 */
module.exports = (page) => {
	let dummyComponent;

	describe('`core/html`', () => {
		beforeEach(async () => {
			dummyComponent = await h.component.waitForComponent(page, '.b-dummy');
		});

		describe('`getSrcSet`', () => {
			it('returns an `srcset` string', async () => {
				const result = (await dummyComponent.evaluate(({modules: {htmlHelpers}}) => htmlHelpers.getSrcSet({
					'2x': 'http://img-hdpi.png',
					'3x': 'http://img-xhdpi.png'
				}))).trim();

				expect(result).toBe('http://img-hdpi.png 2x, http://img-xhdpi.png 3x');
			});
		});
	});
};
