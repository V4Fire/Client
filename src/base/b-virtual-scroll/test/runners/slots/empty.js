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

// eslint-disable-next-line no-inline-comments
module.exports = (/** @type Page */ page) => {

	const components = {
		withSlot: undefined,
		noSlot: undefined,
		withData: undefined
	};

	const nodes = {
		withSlot: undefined,
		noSlot: undefined,
		withData: undefined
	};

	beforeEach(async () => {
		await h.utils.reloadAndWaitForIdle(page);

		for (let keys = Object.keys(components), i = 0; i < keys.length; i++) {
			const key = keys[i];

			nodes[key] = await h.dom.waitForEl(page, `#${key}`);
			// eslint-disable-next-line require-atomic-updates
			components[key] = await h.component.getComponentById(page, key);
		}
	});

	describe('b-virtual-scroll slot empty', () => {
		describe('не рендерит `empty slot`', () => {
			it('если он не задан', async () => {
				expect(await components.noSlot.evaluate((ctx) => Boolean(ctx.vdom.getSlot('empty')))).toBe(false);
				expect(await h.dom.getRef(nodes.noSlot, 'empty')).toBeFalsy();
			});

			it('если есть данные', async () => {
				expect(await components.withData.evaluate((ctx) => Boolean(ctx.vdom.getSlot('empty')))).toBe(true);
				expect(await h.dom.isVisible('#empty', nodes.withData)).toBeFalsy();
			});
		});

		describe('рендерит `empty slot`', () => {
			it('если он задан и нет данных', async () => {
				expect(await components.withSlot.evaluate((ctx) => Boolean(ctx.vdom.getSlot('empty')))).toBe(true);
				expect(await h.dom.getRef(nodes.withSlot, 'empty')).toBeTruthy();
			});
		});
	});
};
