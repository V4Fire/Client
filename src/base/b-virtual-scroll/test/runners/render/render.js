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

	let
		component,
		node,
		container;

	const
		getContainerChildCount = () => component.evaluate((ctx) => ctx.$refs.container.childElementCount);

	const resetComponentState = async (reqParams) => {
		await component.evaluate((ctx, reqParams) => {
			ctx.dataProvider = 'demo.Pagination';
			ctx.chunkSize = 10;
			ctx.request = {get: {chunkSize: 10, id: 'uniq', ...reqParams}};
		}, reqParams);

		await h.dom.waitForEl(container, 'section');
	};

	beforeEach(async () => {
		await h.utils.reloadAndWaitForIdle(page);

		node = await h.dom.waitForEl(page, '#target');
		component = await h.component.waitForComponent(page, '#target');
		container = await h.dom.waitForRef(node, 'container');
	});

	describe('b-virtual-scroll rendering', () => {

		describe('после переинициализации', () => {

			describe('путем изменения `request` пропа', () => {
				it('удаляет старые элементы', async () => {
					await resetComponentState();

					await component.evaluate((ctx) => ctx.request = {get: {chunkSize: 10, total: 0}});
					await h.dom.waitForEl(container, 'section', {to: 'unmount'});

					expect(await getContainerChildCount()).toBe(0);
				});

				it('рендерит новые', async () => {
					await resetComponentState();

					const
						chunkSize = await component.evaluate((ctx) => ctx.requestParams.get.chunkSize);

					expect(await getContainerChildCount()).toBe(chunkSize);

					await component.evaluate((ctx) => ctx.request = {get: {chunkSize: 4, total: 4, id: 'uniq-options'}});

					await h.bom.waitForIdleCallback(page);
					await h.dom.waitForEl(container, 'section');

					const
						newChunkSize = await component.evaluate((ctx) => ctx.requestParams.get.chunkSize);

					expect(await getContainerChildCount()).toBe(newChunkSize);
				});
			});

			describe('путем изменения `dataProvider` пропа', () => {
				it('удаляет старые элементы', async () => {
					await resetComponentState();

					await component.evaluate((ctx) => ctx.dataProvider = undefined);
					await h.dom.waitForEl(container, 'section', {to: 'unmount'});

					expect(await getContainerChildCount()).toBe(0);
				});

				it('рендерит новые', async () => {
					await h.dom.waitForEl(container, 'section', {to: 'unmount'});
					expect(await getContainerChildCount()).toBe(0);

					await component.evaluate((ctx) => ctx.dataProvider = 'demo.Pagination');
					await h.dom.waitForEl(container, 'section');

					expect(await getContainerChildCount()).toBeGreaterThan(0);
				});
			});
		});

		describe('с заданными `options`', () => {
			it('рендерит первый чанк', async () => {
				const
					chunkSize = await component.evaluate((ctx) => ctx.chunkSize);

				await component.evaluate((ctx) => ctx.options = Array.from(Array(40), (v, i) => ({i})));
				await h.dom.waitForEl(container, 'section');

				expect(await getContainerChildCount()).toBe(chunkSize);
			});

			it('рендерит все доступные `options`', async () => {
				await component.evaluate((ctx) => ctx.options = Array.from(Array(40), (v, i) => ({i})));
				await h.dom.waitForEl(container, 'section');

				const
					total = await component.evaluate((ctx) => ctx.options.length),
					checkFn = async () => await getContainerChildCount() === total;

				await h.scroll.scrollToBottomWhile(page, checkFn, {timeout: 1e5});
				expect(await getContainerChildCount()).toBe(total);
			});
		});

		describe('с заданным `dataProvider`', () => {
			it('рендерит первый чанк', async () => {
				await resetComponentState();

				const
					chunkSize = await component.evaluate((ctx) => ctx.chunkSize);

				expect(await getContainerChildCount()).toBe(chunkSize);
			});

			it('рендерит все доступные элементы', async () => {
				await resetComponentState({total: 40});

				const
					total = await component.evaluate((ctx) => ctx.requestParams.get.total),
					checkFn = async () => await getContainerChildCount() === total;

				await h.scroll.scrollToBottomWhile(page, checkFn, {timeout: 1e5});

				expect(await getContainerChildCount()).toBe(total);
			});
		});

		describe('без заданных `options` и `dataProvider`', () => {
			it('не рендерит ничего', async () => {
				expect(await component.evaluate((ctx) => ctx.options.length)).toBe(0);
				expect(await component.evaluate((ctx) => ctx.dataProvider)).toBeUndefined();
				expect(await getContainerChildCount()).toBe(0);
			});
		});
	});
};
