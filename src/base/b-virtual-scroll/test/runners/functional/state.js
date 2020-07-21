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
		firstChunkExpected = getArray(),
		secondChunkExpected = getArray(12);

	const getExpected = (params = {}) => ({
		items: undefined,

		itemsTillBottom: undefined,
		currentPage: 0,
		nextPage: 1,
		isLastEmpty: false,
		total: undefined,

		data: [],
		pendingData: [],

		lastLoadedData: [],
		lastLoadedChunk: {
			raw: undefined,
			normalized: []
		},
		...params
	});

	const getCurrentComponentState = () => component.evaluate((ctx) => ({
		...ctx.getCurrentState(),
		itemsTillBottom: undefined,
		items: undefined
	}));

	const setProps = (requestProps = {}) => component.evaluate((ctx, requestProps) => {
		ctx.dataProvider = 'demo.Pagination';
		ctx.chunkSize = 10;
		ctx.request = {get: {chunkSize: 12, id: 'uniq', ...requestProps}};
		ctx.componentConverter = (v) => ({data: v.data});
	}, requestProps);

	describe('b-virtual-scroll getCurrentState', () => {

		describe('возвращает корректно значение', () => {
			it('если нет `dataProvider`', async () => {
				const expected = getExpected({currentPage: 0, nextPage: 1});

				expect(await getCurrentComponentState()).toEqual(expected);
			});

			it('после загрузки первого чанка', async () => {
				const expected = getExpected({
					currentPage: 1,
					nextPage: 2,
					data: firstChunkExpected.data,
					pendingData: getArray(10, 2).data,
					lastLoadedData: firstChunkExpected.data,
					lastLoadedChunk: {
						raw: firstChunkExpected,
						normalized: firstChunkExpected.data
					}
				});

				await setProps();
				await h.dom.waitForEl(container, 'section');

				expect(await getCurrentComponentState()).toEqual(expected);
			});

			it('после загрузки второго чанка', async () => {
				const expected = getExpected({
					currentPage: 2,
					nextPage: 3,
					data: getArray(0, 24).data,
					pendingData: getArray(20, 4).data,
					lastLoadedData: secondChunkExpected.data,
					lastLoadedChunk: {
						raw: secondChunkExpected,
						normalized: secondChunkExpected.data
					}
				});

				await setProps();
				await h.dom.waitForEl(container, 'section');

				await h.scroll.scrollToBottom(page);
				await h.dom.waitForEl(container, 'section:nth-child(11)');

				expect(await getCurrentComponentState()).toEqual(expected);
			});

			it('после переинициализации и без похода в `dataProvider`', async () => {
				const expected = getExpected({currentPage: 0, nextPage: 1});

				await setProps();
				await h.dom.waitForEl(container, 'section');

				await component.evaluate((ctx) => {
					ctx.dataProvider = '';
					ctx.request = undefined;
					ctx.reInit();
				});

				await h.dom.waitForEl(container, 'section', {to: 'unmount'});
				await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 200});

				expect(await getCurrentComponentState()).toEqual(expected);
			});

			it('после переинициализации и с походом в `dataProvider`', async () => {
				const expected = getExpected({
					currentPage: 1,
					nextPage: 2,
					data: firstChunkExpected.data,
					pendingData: getArray(10, 2).data,
					lastLoadedData: firstChunkExpected.data,
					lastLoadedChunk: {
						raw: firstChunkExpected,
						normalized: firstChunkExpected.data
					}
				});

				await setProps();
				await h.dom.waitForEl(container, 'section');

				await setProps({id: 'new-id'});
				await h.dom.waitForEl(container, 'section', {to: 'unmount'});
				await h.dom.waitForEl(container, 'section', {to: 'mount'});

				expect(await getCurrentComponentState()).toEqual(expected);
			});

			it('если для полноценного чанка пришлось сходить несколько раз в `dataProvider`', async () => {
				const expected = getExpected({
					currentPage: 3,
					nextPage: 4,
					data: firstChunkExpected.data,
					pendingData: getArray(10, 2).data,
					lastLoadedData: getArray(8, 4).data,
					lastLoadedChunk: {
						raw: getArray(8, 4),
						normalized: getArray(8, 4).data
					}
				});

				await setProps({chunkSize: 4});
				await h.dom.waitForEl(container, 'section');

				expect(await getCurrentComponentState()).toEqual(expected);
			});
		});
	});

	describe('b-virtual-scroll buildState', () => {

		describe('возвращает корректно значение', () => {
			it('если передан `chunkRequest` и `chunkRender`', async () => {
				const expected = getExpected();

				expect(await component.evaluate((ctx) => ctx.buildState({
					items: undefined,
					itemsTillBottom: undefined
				}))).toEqual(expected);
			});

			it('если передан `chunkRequest` но не передан `chunkRender`', async () => {
				const expected = getExpected();

				expect(await component.evaluate((ctx) => ctx.buildState({
					items: undefined,
					itemsTillBottom: undefined
				}, ctx.chunkRequest))).toEqual(expected);
			});

			it('если переданы override параметры и `chunkRequest`, `chunkRender`', async () => {
				const expected = getExpected({
					currentPage: 1,
					nextPage: 2
				});

				expect(await component.evaluate((ctx) => ctx.buildState({
					items: undefined,
					itemsTillBottom: undefined
				}, ctx.chunkRequest, ctx.chunkRender))).toEqual(expected);
			});
		});
	});

};
