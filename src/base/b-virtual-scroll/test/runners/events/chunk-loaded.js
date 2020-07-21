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

	beforeEach(async () => {
		await h.utils.reloadAndWaitForIdle(page);

		component = await h.component.waitForComponent(page, '#target');
		node = await h.dom.waitForEl(page, '#target');
		container = await h.dom.waitForRef(node, 'container');
	});

	const
		getArray = (offset = 0, length = 12) => ({data: Array.from(Array(length), (v, i) => ({i: i + offset}))}),
		firstChunkExpected = getArray();

	const subscribe = () => component.evaluate((ctx) => new Promise((res) => ctx.watch(':onChunkLoaded', res)));

	const setProps = (requestProps = {}) => component.evaluate((ctx, requestProps) => {
		ctx.dataProvider = 'demo.Pagination';
		ctx.chunkSize = 10;
		ctx.request = {get: {chunkSize: 12, id: 'uniq', ...requestProps}};
	}, requestProps);

	describe('b-virtual-scroll chunkLoaded event', () => {

		describe('вызывается', () => {
			it('при загрузке первого чанка', async () => {
				const subscribePromise = subscribe();
				await setProps();

				await expectAsync(subscribePromise).toBeResolved();
			});

			it('при загрузке второго чанка', async () => {
				await setProps();
				await h.dom.waitForEl(container, 'section');

				const subscribePromise = subscribe();

				await h.scroll.scrollToBottom(page);
				await expectAsync(subscribePromise).toBeResolved();
			});

			it('при загрузке первого чанка после переинициализации', async () => {
				await setProps();
				await h.dom.waitForEl(container, 'section');

				const subscribePromise = subscribe();

				await component.evaluate((ctx) => ctx.request = {get: {chunkSize: 20}});
				await expectAsync(subscribePromise).toBeResolved();
			});

			it('три раза если надо набрать на цельный чанк', async () => {
				await component.evaluate((ctx) => {
					ctx.watch(':onChunkLoaded', () => {
						ctx.tmp.called = (ctx.tmp.called ?? 0) + 1;
					});
				});

				await setProps({chunkSize: 4});
				await h.dom.waitForEl(container, 'section');

				expect(await component.evaluate((ctx) => ctx.tmp.called)).toBe(3);
			});

			it('при успешной загрузки первого чанка без payload', async () => {
				const subscribePromise = subscribe();

				await setProps({chunkSize: 0, total: 0});

				await expectAsync(subscribePromise).toBeResolved();
			});

			it('при успешной загрузки второго чанка без payload', async () => {
				await setProps({chunkSize: 12, total: 12});
				await h.dom.waitForEl(container, 'section');

				const subscribePromise = subscribe();

				await h.scroll.scrollToBottom(page);
				await expectAsync(subscribePromise).toBeResolved();
			});
		});

		describe('не вызывается', () => {
			it('если произошла ошибка загрузка', async () => {
				await component.evaluate((ctx) => ctx.watch(':onChunkLoaded', () => ctx.tmp.change = true));

				await setProps({failOn: 0});
				await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 1000});

				expect(await component.evaluate((ctx) => ctx.tmp.change)).toBeUndefined();
			});
		});

		describe('имеет корректный payload', () => {
			it('при загрузке первого чанка', async () => {
				const subscribePromise = subscribe();

				await component.evaluate((ctx) => {
					ctx.dataProvider = 'demo.Pagination';
					ctx.chunkSize = 10;
					ctx.request = {get: {chunkSize: 12, additionalData: {size: 12}}};
				});

				await expectAsync(subscribePromise).toBeResolvedTo({
					normalized: firstChunkExpected.data,
					raw: {data: firstChunkExpected.data, size: 12}
				});
			});

			it('при загрузке второго чанка', async () => {
				await component.evaluate((ctx) => {
					ctx.dataProvider = 'demo.Pagination';
					ctx.chunkSize = 10;
					ctx.request = {get: {chunkSize: 12, additionalData: {size: 12}}};
				});

				await h.dom.waitForEl(container, 'section');

				const subscribePromise = subscribe();

				await h.scroll.scrollToBottom(page);
				await expectAsync(subscribePromise).toBeResolved({
					normalized: firstChunkExpected.data,
					raw: {data: firstChunkExpected.data, size: 12}
				});
			});

			it('при загрузке первого чанка с пустым payload', async () => {
				const subscribePromise = subscribe();

				await component.evaluate((ctx) => {
					ctx.dataProvider = 'demo.Pagination';
					ctx.chunkSize = 10;
					ctx.request = {get: {id: 'uniq', chunkSize: 0, total: 0, additionalData: {size: 12}}};
				});

				await expectAsync(subscribePromise).toBeResolved({
					normalized: [],
					raw: {data: [], size: 12}
				});
			});

			it('при загрузке второго чанка с пустым payload', async () => {
				await component.evaluate((ctx) => {
					ctx.dataProvider = 'demo.Pagination';
					ctx.chunkSize = 10;
					ctx.request = {get: {id: 'uniq', hunkSize: 12, total: 12, additionalData: {size: 12}}};
				});

				await h.dom.waitForEl(container, 'section');

				const subscribePromise = subscribe();

				await h.scroll.scrollToBottom(page);
				await expectAsync(subscribePromise).toBeResolved({
					normalized: [],
					raw: {data: [], size: 12}
				});
			});

			it('при загрузке первого чанка частями', async () => {
				await component.evaluate((ctx) => {
					ctx.tmp.eventAccumulator = {};

					ctx.watch(':onChunkLoaded', (val) => {
						ctx.tmp.called = (ctx.tmp.called ?? 0) + 1;
						ctx.tmp.eventAccumulator[ctx.tmp.called] = Object.fastClone(val);
					});

					ctx.dataProvider = 'demo.Pagination';
					ctx.chunkSize = 10;
					ctx.request = {get: {chunkSize: 4, id: 'uniq', additionalData: {size: 12}}};
				});

				await h.dom.waitForEl(container, 'section');

				expect(await component.evaluate((ctx) => ctx.tmp.eventAccumulator)).toEqual({
					1: {normalized: getArray(0, 4).data, raw: {data: getArray(0, 4).data, size: 12}},
					2: {normalized: getArray(4, 4).data, raw: {data: getArray(4, 4).data, size: 12}},
					3: {normalized: getArray(8, 4).data, raw: {data: getArray(8, 4).data, size: 12}}
				});
			});
		});
	});
};
