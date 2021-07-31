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
		ctx.request = {get: {chunkSize: 12, id: Math.random(), ...requestProps}};
	}, requestProps);

	describe('b-virtual-scroll `chunkLoaded` event', () => {
		describe('emitted', () => {
			it('after loading the first chunk', async () => {
				const subscribePromise = subscribe();
				await setProps();

				await expectAsync(subscribePromise).toBeResolved();
			});

			it('after loading the second chunk', async () => {
				await setProps();
				await h.dom.waitForEl(container, 'section');

				const subscribePromise = subscribe();

				await h.scroll.scrollToBottom(page);
				await expectAsync(subscribePromise).toBeResolved();
			});

			it('when loading the first chunk after re-initialization', async () => {
				await setProps();
				await h.dom.waitForEl(container, 'section');

				const subscribePromise = subscribe();

				await component.evaluate((ctx) => ctx.request = {get: {chunkSize: 20}});
				await expectAsync(subscribePromise).toBeResolved();
			});

			it('three times to get the full data batch', async () => {
				await component.evaluate((ctx) => {
					ctx.watch(':onChunkLoaded', () => {
						ctx.tmp.called = (ctx.tmp.called ?? 0) + 1;
					});
				});

				await setProps({chunkSize: 4});
				await h.dom.waitForEl(container, 'section');

				expect(await component.evaluate((ctx) => ctx.tmp.called)).toBe(3);
			});

			it('after successful loading of the first chunk without payload', async () => {
				const subscribePromise = subscribe();

				await setProps({chunkSize: 0, total: 0});

				await expectAsync(subscribePromise).toBeResolved();
			});

			it('after successful loading of the second chunk without payload', async () => {
				await setProps({chunkSize: 12, total: 12});
				await h.dom.waitForEl(container, 'section');

				const subscribePromise = subscribe();

				await h.scroll.scrollToBottom(page);
				await expectAsync(subscribePromise).toBeResolved();
			});
		});

		describe('not emitted', () => {
			it('if there was a request error', async () => {
				await component.evaluate((ctx) => ctx.watch(':onChunkLoaded', () => ctx.tmp.change = true));

				await setProps({failOn: 0});
				await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 1000});

				expect(await component.evaluate((ctx) => ctx.tmp.change)).toBeUndefined();
			});
		});

		describe('has correct payload', () => {
			it('after loading the first chunk', async () => {
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

			it('after loading the second chunk', async () => {
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

			it('after loading the first chunk with an empty payload', async () => {
				const subscribePromise = subscribe();

				await component.evaluate((ctx) => {
					ctx.dataProvider = 'demo.Pagination';
					ctx.chunkSize = 10;
					ctx.request = {get: {id: Math.random(), chunkSize: 0, total: 0, additionalData: {size: 12}}};
				});

				await expectAsync(subscribePromise).toBeResolved({
					normalized: [],
					raw: {data: [], size: 12}
				});
			});

			it('after loading the second chunk with an empty payload', async () => {
				await component.evaluate((ctx) => {
					ctx.dataProvider = 'demo.Pagination';
					ctx.chunkSize = 10;
					ctx.request = {get: {id: Math.random(), chunkSize: 12, total: 12, additionalData: {size: 12}}};
				});

				await h.dom.waitForEl(container, 'section');

				const subscribePromise = subscribe();

				await h.scroll.scrollToBottom(page);
				await expectAsync(subscribePromise).toBeResolved({
					normalized: [],
					raw: {data: [], size: 12}
				});
			});

			it('when loading the first chunk in parts', async () => {
				await component.evaluate((ctx) => {
					ctx.tmp.eventAccumulator = {};

					ctx.watch(':onChunkLoaded', (val) => {
						ctx.tmp.called = (ctx.tmp.called ?? 0) + 1;
						ctx.tmp.eventAccumulator[ctx.tmp.called] = Object.fastClone(val);
					});

					ctx.dataProvider = 'demo.Pagination';
					ctx.chunkSize = 10;
					ctx.request = {get: {chunkSize: 4, id: Math.random(), additionalData: {size: 12}}};
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
