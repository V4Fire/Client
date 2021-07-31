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
		component,
		node,
		container;

	const
		getContainerChildCount = () => component.evaluate((ctx) => ctx.$refs.container.childElementCount);

	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();

			const baseAttrs = {
				theme: 'demo',
				option: 'section',
				optionProps: ({current}) => ({'data-index': current.i})
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

		await h.bom.waitForIdleCallback(page);
		await h.component.waitForComponentStatus(page, '.b-virtual-scroll', 'ready');

		node = await h.dom.waitForEl(page, '#target');
		component = await h.component.waitForComponent(page, '#target');
		container = await h.dom.waitForRef(node, 'container');

		await component.evaluate((ctx) => {
			ctx.dataProvider = 'demo.Pagination';
			ctx.chunkSize = 10;
			ctx.request = {get: {chunkSize: 10, id: Math.random()}};
		});
	});

	describe('b-virtual-scroll', () => {
		['manual', 'scroll'].forEach((strategy) => {
			describe(`renderNext with loadStrategy: ${strategy}`, () => {
				it('renders the next data batch', async () => {
					await component.evaluate((ctx, strategy) => {
						ctx.loadStrategy = strategy;
						ctx.request = {get: {chunkSize: 20, id: Math.random()}};
					}, strategy);

					await h.dom.waitForEl(container, 'section');

					expect(await component.evaluate((ctx) => ctx.chunkRequest.pendingData.length)).toBe(10);
					await component.evaluate((ctx) => ctx.renderNext());

					expect(await component.evaluate((ctx) => ctx.chunkRequest.pendingData.length)).toBe(0);
					await h.dom.waitForEl(container, 'section:nth-child(11)');

					expect(await getContainerChildCount()).toBe(20);
				});

				it('requests and renders the next data batch', async () => {
					await component.evaluate((ctx, strategy) => {
						ctx.loadStrategy = strategy;
						ctx.request = {get: {chunkSize: 10, id: Math.random()}};
					}, strategy);

					await h.dom.waitForEl(container, 'section');
					expect(await component.evaluate((ctx) => ctx.chunkRequest.pendingData.length)).toBe(0);

					await component.evaluate((ctx) => ctx.renderNext());
					await h.dom.waitForEl(container, 'section:nth-child(11)');

					expect(await component.evaluate((ctx) => ctx.chunkRequest.pendingData.length)).toBe(0);
					expect(await getContainerChildCount()).toBe(20);
				});
			});
		});
	});
};
