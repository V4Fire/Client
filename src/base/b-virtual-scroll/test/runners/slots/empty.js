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
				expect(await h.dom.isVisible('#empty', nodes.emptyWithData)).toBeFalsy();
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
