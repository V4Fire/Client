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

/** @param {Page} page */
module.exports = (page) => {
	const components = {
		emptyWithSlot: undefined,
		emptyNoSlot: undefined,
		emptyWithData: undefined
	};

	const nodes = {
		emptyWithSlot: undefined,
		emptyNoSlot: undefined,
		emptyWithData: undefined
	};

	beforeAll(async () => {
		await page.evaluate(() => {
			const baseAttrs = {
				theme: 'demo',
				option: 'section',
				optionProps: ({current}) => ({'data-index': current.i})
			};

			const slots = {
				empty: {
					tag: 'div',
					attrs: {
						id: 'empty',
						'data-test-ref': 'empty'
					},
					content: 'Empty'
				}
			};

			const scheme = [
				{
					attrs: {
						...baseAttrs,
						dataProvider: 'demo.Pagination',
						dbConverter: ({data}) => ({data: data.splice(0, 4)}),
						id: 'emptyNoSlot'
					}
				},
				{
					attrs: {
						...baseAttrs,
						dataProvider: 'demo.Pagination',
						dbConverter: ({data}) => ({data: data.splice(0, 4)}),
						request: {get: {chunkSize: 8, total: 8}},
						id: 'emptyWithData'
					},

					content: {
						empty: slots.empty
					}
				},
				{
					attrs: {
						...baseAttrs,
						dataProvider: 'demo.Pagination',
						dbConverter: () => ({data: []}),
						id: 'emptyWithSlot'
					},

					content: {
						empty: slots.empty
					}
				}
			];

			globalThis.renderComponents('b-virtual-scroll', scheme);
		});

		await h.bom.waitForIdleCallback(page);

		for (let keys = Object.keys(components), i = 0; i < keys.length; i++) {
			const key = keys[i];

			nodes[key] = await h.dom.waitForEl(page, `#${key}`);
			await nodes[key].evaluate((ctx) => ctx.style.display = '');

			// eslint-disable-next-line require-atomic-updates
			components[key] = await h.component.getComponentById(page, key);
		}
	});

	describe('b-virtual-scroll slot empty', () => {
		describe('does not render `empty slot`', () => {
			it('if it is not set', async () => {
				expect(await components.emptyNoSlot.evaluate((ctx) => Boolean(ctx.vdom.getSlot('empty')))).toBe(false);
				expect(await h.dom.getRef(nodes.emptyNoSlot, 'empty')).toBeFalsy();
			});

			it('if there is data', async () => {
				expect(await components.emptyWithData.evaluate((ctx) => Boolean(ctx.vdom.getSlot('empty')))).toBe(true);
				expect(await nodes.emptyWithData.waitForSelector('#empty', {state: 'hidden'})).toBeFalsy();
			});
		});

		describe('render `empty slot`', () => {
			it('if it is set and there is no data', async () => {
				expect(await components.emptyWithSlot.evaluate((ctx) => Boolean(ctx.vdom.getSlot('empty')))).toBe(true);
				expect(await h.dom.getRef(nodes.emptyWithSlot, 'empty')).toBeTruthy();
			});
		});
	});
};
