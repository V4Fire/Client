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
 * @param {Page} page
 */
module.exports = (page) => {
	let
		node,
		container;

	beforeEach(async () => {
		await h.component.waitForComponent(page, '#root-component');

		await page.evaluate(() => {
			globalThis.removeCreatedComponents();

			const baseAttrs = {
				theme: 'demo',
				dataProvider: 'demo.Pagination',
				chunkSize: 10,
				request: {get: {chunkSize: 10, id: Math.random()}},
				item: 'section',
				itemProps: ({current}) => ({'data-index': current.i})
			};

			const scheme = [
				{
					attrs: {
						...baseAttrs,
						id: 'target'
					}
				}
			];

			globalThis.renderComponents('b-virtual-scroll', scheme);
		});

		node = await h.dom.waitForEl(page, '#target');
		container = await h.dom.waitForRef(node, 'container');
	});

	describe('b-virtual-scroll with iItems trait', () => {
		it('renders correct item', async () => {
			await h.dom.waitForEl(container, 'section');
			expect(await container.$('section')).toBeTruthy();
		});

		it('renders item with provided props', async () => {
			await h.dom.waitForEl(container, 'section');
			const attrVal = await (await container.$('section')).evaluate((el) => el.getAttribute('data-index'));
			expect(Number(attrVal)).toBe(0);
		});
	});

};
