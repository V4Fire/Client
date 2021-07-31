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

/** @param {Page} page */
module.exports = (page) => {
	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('i-block providing of styles', () => {
		it('to a regular component', async () => {
			const target = await init();

			expect(await target.evaluate((ctx) => ctx.$el.getAttribute('style')))
				.toBe('background-color: red; color: blue; font-size: 12px;');
		});

		it('to a functional component', async () => {
			const target = await init({component: 'b-dummy-functional'});

			expect(await target.evaluate((ctx) => ctx.isFunctional))
				.toBeTrue();

			expect(await target.evaluate((ctx) => ctx.$el.getAttribute('style')))
				.toBe('background-color: red; color: blue; font-size: 12px;');
		});
	});

	async function init(attrs = {}) {
		await page.evaluate((attrs = {}) => {
			const component = attrs.component ?? 'b-dummy';
			delete attrs.component;

			const scheme = [
				{
					attrs: {
						id: 'target',
						style: ['background-color: red; color: blue', {'font-size': '12px'}],
						...attrs
					}
				}
			];

			globalThis.renderComponents(component, scheme);
		}, attrs);

		return h.component.waitForComponent(page, '#target');
	}
};
