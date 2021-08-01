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
	let
		node,
		container,
		component;

	const renderComponent = async (attrs = {}) => {
		await page.evaluate(([attrs]) => {
			globalThis.removeCreatedComponents();

			const baseAttrs = {
				theme: 'demo',
				dataProvider: 'demo.Pagination',
				chunkSize: 10,
				request: {get: {chunkSize: 10, id: Math.random()}},
				item: 'section',
				itemProps: ({current}) => ({'data-index': current.i}),
				itemKey: (data) => data.i,
				optionKey: (data) => data.i
			};

			const scheme = [
				{
					attrs: {
						...baseAttrs,
						id: 'target',
						...attrs
					}
				}
			];

			globalThis.renderComponents('b-virtual-scroll', scheme);
		}, [attrs]);

		node = await h.dom.waitForEl(page, '#target');
		component = await h.component.waitForComponent(page, '#target');
		container = await h.dom.waitForRef(node, 'container');
	};

	beforeEach(async () => {
		await h.component.waitForComponent(page, '#root-component');
		await page.evaluate(() => globalThis.removeCreatedComponents());
	});

	describe('b-virtual-scroll with the `iItems` trait', () => {
		it('renders a correct item', async () => {
			await renderComponent();
			await h.dom.waitForEl(container, 'section');
			expect(await container.$('section')).toBeTruthy();
		});

		it('renders an item with provided props', async () => {
			await renderComponent();
			await h.dom.waitForEl(container, 'section');
			const attrVal = await (await container.$('section')).evaluate((el) => el.getAttribute('data-index'));
			expect(parseInt(attrVal, 10)).toBe(0);
		});

		it('uses the deprecated `optionKey` property', async () => {
			await renderComponent({
				itemKey: undefined
			});

			const optionKey1 = await component.evaluate((ctx) => ctx.getItemKey({i: 0}));
			expect(optionKey1).toBe(0);

			const optionKey2 = await component.evaluate((ctx) => ctx.getItemKey({i: 1}));
			expect(optionKey2).toBe(1);
		});

		it('uses the `itemKey` property', async () => {
			await renderComponent({
				optionKey: undefined
			});

			const itemKey1 = await component.evaluate((ctx) => ctx.getItemKey({i: 0}));
			expect(itemKey1).toBe(0);

			const itemKey2 = await component.evaluate((ctx) => ctx.getItemKey({i: 1}));
			expect(itemKey2).toBe(1);
		});
	});

};
