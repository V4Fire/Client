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
		component,
		node,
		container;

	const
		getContainerChildCount = () => component.evaluate((ctx) => ctx.$refs.container.childElementCount);

	const setProps = async (reqParams) => {
		await component.evaluate((ctx, reqParams) => {
			ctx.dataProvider = 'demo.Pagination';
			ctx.chunkSize = 10;
			ctx.request = {get: {chunkSize: 10, id: 'uniq', ...reqParams}};
		}, reqParams);

		await h.dom.waitForEl(container, 'section');
	};

	beforeEach(async () => {
		node = await h.dom.waitForEl(page, '#target');
		component = await h.component.waitForComponent(page, '#target');
		container = await h.dom.waitForRef(node, 'container');

		await component.evaluate((ctx) => {
			ctx.dataProvider = undefined;
			ctx.request = undefined;
		});
	});

	describe('b-virtual-scroll', () => {
		describe('renderNext', () => {
			it('with `loadStrategy: manual` renders a next data batch', async () => {
				// ...
			});

			it('with `loadStrategy: manual` requests and renders a next data batch', async () => {
				// ...
			});

			it('with `loadStrategy: scroll`, renders a next data batch', async () => {
				// ...
			});

			it('with `loadStrategy: scroll` requests and renders a next data batch', async () => {
				// ...
			});
		});

	});

};
