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
		...ctx.getCurrentDataState(),
		itemsTillBottom: undefined,
		items: undefined
	}));

	const setProps = (requestProps = {}) => component.evaluate((ctx, requestProps) => {
		ctx.dataProvider = 'demo.Pagination';
		ctx.chunkSize = 10;
		ctx.request = {get: {chunkSize: 12, id: Math.random(), ...requestProps}};
		ctx.componentConverter = (v) => ({data: v.data});
	}, requestProps);

	beforeEach(async () => {
		await h.utils.reloadAndWaitForIdle(page);
		await h.component.waitForComponent(page, '#root-component');

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

		component = await h.component.waitForComponent(page, '#target');
		node = await h.dom.waitForEl(page, '#target');
		container = await h.dom.waitForRef(node, 'container');
	});

	describe('b-virtual-scroll getCurrentDataState', () => {
		describe('returns the correct value', () => {
			it('if there is no `dataProvider`', async () => {
				const
					expected = getExpected(),
					current = await getCurrentComponentState();

				expect(current).toEqual(expected);
			});

			it('after loading the first chunk', async () => {
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

				const current = await getCurrentComponentState();
				expect(current).toEqual(expected);
			});

			it('after loading the second chunk', async () => {
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

				const current = await getCurrentComponentState();
				expect(current).toEqual(expected);
			});

			it('after re-initialization and without `dataProvider`', async () => {
				const expected = getExpected({currentPage: 0, nextPage: 1});

				await setProps();
				await h.dom.waitForEl(container, 'section');

				await component.evaluate((ctx) => {
					ctx.dataProvider = '';
					ctx.request = undefined;
					ctx.reInit();
				});

				await h.dom.waitForEl(container, 'section', {to: 'unmount'});
				await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 1000});

				const current = await getCurrentComponentState();
				expect(current).toEqual(expected);
			});

			it('after re-initialization and with `dataProvider`', async () => {
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

				await setProps({id: Math.random()});
				await h.dom.waitForEl(container, 'section', {to: 'unmount'});
				await h.dom.waitForEl(container, 'section', {to: 'mount'});

				const current = await getCurrentComponentState();
				expect(current).toEqual(expected);
			});

			it('if for the full loading it was necessary to go several times to `dataProvider`', async () => {
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

				const current = await getCurrentComponentState();
				expect(current).toEqual(expected);
			});
		});
	});

	describe('b-virtual-scroll getDataStateSnapshot', () => {
		describe('returns the correct value', () => {
			it('with `chunkRequest` and `chunkRender`', async () => {
				const
					expected = getExpected(),
					current = await component.evaluate((ctx) => ctx.getDataStateSnapshot({
						items: undefined,
						itemsTillBottom: undefined
					}));

				expect(current).toEqual(expected);
			});

			it('with `chunkRequest`', async () => {
				const
					expected = getExpected(),
					current = await component.evaluate((ctx) => ctx.getDataStateSnapshot({
						items: undefined,
						itemsTillBottom: undefined
					}, ctx.chunkRequest));

				expect(current).toEqual(expected);
			});

			it('with override params, `chunkRequest` and `chunkRender`', async () => {
				const expected = getExpected({
					currentPage: 1,
					nextPage: 2
				});

				const current = await component.evaluate((ctx) => ctx.getDataStateSnapshot({
					items: undefined,
					itemsTillBottom: undefined
				}, ctx.chunkRequest, ctx.chunkRender));

				expect(current).toEqual(expected);
			});
		});
	});

};
