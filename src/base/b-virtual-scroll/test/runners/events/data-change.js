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
		getArray = (offset = 0, length = 12) => Array.from(Array(length), (v, i) => ({i: i + offset})),
		firstChunkExpected = getArray(),
		secondChunkExpected = getArray(12);

	const setProps = (requestProps = {}) => component.evaluate((ctx, requestProps) => {
		ctx.dataProvider = 'demo.Pagination';
		ctx.chunkSize = 10;
		ctx.request = {get: {chunkSize: 12, id: Math.random(), ...requestProps}};
	}, requestProps);

	const subscribe = () => component.evaluate((ctx) => new Promise((res) => ctx.watch(':onDataChange', res)));

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

		await h.component.waitForComponentStatus(page, '.b-virtual-scroll', 'ready');
		await h.bom.waitForIdleCallback(page);

		component = await h.component.waitForComponent(page, '#target');
		node = await h.dom.waitForEl(page, '#target');
		container = await h.dom.waitForRef(node, 'container');
	});

	describe('b-virtual-scroll dataChange event', () => {
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

			it('after loading the first part of the batch and stopping further loading because `shouldStopRequest` have returned `true`', async () => {
				const subscribePromise = subscribe();

				await component.evaluate((ctx) => {
					ctx.dataProvider = 'demo.Pagination';
					ctx.request = {get: {chunkSize: 4, id: Math.random()}};
					ctx.shouldStopRequest = () => true;
				});

				await expectAsync(subscribePromise).toBeResolvedTo(getArray(0, 4));
			});

			it('after loading the second part of the batch and stopping further loading because `shouldStopRequest` have returned `true`', async () => {
				const subscribePromise = subscribe();

				await component.evaluate((ctx) => {
					ctx.dataProvider = 'demo.Pagination';
					ctx.request = {get: {chunkSize: 4, id: Math.random()}};
					ctx.shouldStopRequest = (v) => v.pendingData.length === 8;
				});

				await expectAsync(subscribePromise).toBeResolvedTo(getArray(0, 8));
			 });

			 it('after loading the first part of the second batch and stopping further loading because `shouldStopRequest` have returned `true`', async () => {
				await component.evaluate((ctx) => {
					ctx.dataProvider = 'demo.Pagination';
					ctx.request = {get: {chunkSize: 4, id: Math.random()}};
					ctx.shouldStopRequest = (v) => {
						const {lastLoadedChunk: {normalized}} = v;
						return normalized[normalized.length - 1].i === 15;
					};
				});

				await h.dom.waitForEl(container, 'section');

				const subscribePromise = subscribe();
				await h.scroll.scrollToBottom(page);

				await expectAsync(subscribePromise).toBeResolvedTo(getArray(12, 4));
			 });

		});

		describe('not emitted', () => {
			it('if there was a request error', async () => {
				await component.evaluate((ctx) => ctx.watch(':onDataChange', () => ctx.tmp.change = true));

				await setProps({failOn: 0});
				await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 1000});

				expect(await component.evaluate((ctx) => ctx.tmp.change)).toBeUndefined();
			});

			it('if there was a request error on the second chunk', async () => {
				await setProps({failOn: 1});
				await h.dom.waitForEl(container, 'section');

				await component.evaluate((ctx) => ctx.watch(':onDataChange', () => ctx.tmp.change = true));

				await h.scroll.scrollToBottom(page);
				await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 500});

				expect(await component.evaluate((ctx) => ctx.tmp.change)).toBeUndefined();
			});
		});

		describe('has correct payload', () => {
			it('if nothing was loaded', async () => {
				const subscribePromise = subscribe();

				await setProps({total: 0, chunkSize: 0});
				await expectAsync(subscribePromise).toBeResolvedTo([]);
			});

			describe('after loading', () => {
				it('first chunk', async () => {
					const subscribePromise = subscribe();

					await setProps({chunkSize: 12});
					await expectAsync(subscribePromise).toBeResolvedTo(firstChunkExpected);
				});

				it('second chunk', async () => {
					await setProps({chunkSize: 12});
					await h.dom.waitForEl(container, 'section');

					const subscribePromise = subscribe();

					await h.scroll.scrollToBottom(page);
					await expectAsync(subscribePromise).toBeResolvedTo(secondChunkExpected);
				});
			});

			describe('after re-initialization', () => {
				it('and loading the first chunk with 2 requests', async () => {
					await setProps({id: undefined});
					await h.dom.waitForEl(container, 'section');

					const subscribePromise = subscribe();

					await component.evaluate((ctx) => ctx.request = {get: {chunkSize: 6, id: Math.random()}});

					await expectAsync(subscribePromise).toBeResolvedTo(firstChunkExpected);
				});

				it('and loading the second chunk with 2 requests', async () => {
					await setProps({id: undefined});
					await h.dom.waitForEl(container, 'section');

					await component.evaluate((ctx) => ctx.watch(':onDataChange', (val) => {
						ctx.tmp.currentCall = ctx.tmp.currentCall ?? 0;
						ctx.tmp[ctx.tmp.currentCall] = val;
						ctx.tmp.currentCall++;
					}));

					await component.evaluate((ctx) => ctx.request = {get: {chunkSize: 6, id: Math.random()}});
					await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 1000});

					expect(await component.evaluate((ctx) => ctx.tmp[0])).toEqual(firstChunkExpected);

					await h.scroll.scrollToBottom(page);
					await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 1000});

					expect(await component.evaluate((ctx) => ctx.tmp[1])).toEqual(secondChunkExpected);
				});
			});
		});
	});
};
