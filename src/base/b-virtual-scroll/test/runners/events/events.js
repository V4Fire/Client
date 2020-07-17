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
		firstChunkExpected = {data: Array.from(Array(12), (v, i) => ({i}))},
		secondChunkExpected = {data: Array.from(Array(12), (v, i) => ({i: i + 12}))};

	const setProps = (requestProps = {}) => component.evaluate((ctx, requestProps) => {
		ctx.dataProvider = 'demo.Pagination';
		ctx.chunkSize = 10;
		ctx.request = {get: {chunkSize: 12, id: 'uniq', ...requestProps}};
	}, requestProps);

	const subscribe = (eventName) => component.evaluate((ctx, eventName) => new Promise((res) => ctx.watch(`:${eventName}`, res)), eventName);

	beforeEach(async () => {
		await h.utils.reloadAndWaitForIdle(page);

		component = await h.component.waitForComponent(page, '#target');
		node = await h.dom.waitForEl(page, '#target');
		container = await h.dom.waitForRef(node, 'container');
	});

	describe('b-virtual-scroll events', () => {

		describe('dataChange', () => {

			describe('вызывается', () => {
				it('при загрузке первого чанка', async () => {
					const subscribePromise = subscribe('onDataChange');

					await setProps();
					await expectAsync(subscribePromise).toBeResolved();
				});

				it('при загрузки второго чанке', async () => {
					await setProps();
					await h.dom.waitForEl(container, 'section');

					const subscribePromise = subscribe('onDataChange');

					await h.scroll.scrollToBottom(page);
					await expectAsync(subscribePromise).toBeResolved();
				});

			});

			describe('не вызывается', () => {
				it('если произошла ошибка загрузки', async () => {
					await component.evaluate((ctx) => ctx.watch(':onDataChange', () => ctx.tmp.change = true));

					await setProps({failOn: 0});
					await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 1000});

					expect(await component.evaluate((ctx) => ctx.tmp.change)).toBeUndefined();
				});

				it('если произошла ошибка загрузки на втором чанке', async () => {
					await setProps({failOn: 1});
					await h.dom.waitForEl(container, 'section');

					await component.evaluate((ctx) => ctx.watch(':onDataChange', () => ctx.tmp.change = true));

					await h.scroll.scrollToBottom(page);
					await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 1000});

					expect(await component.evaluate((ctx) => ctx.tmp.change)).toBeUndefined();
				});
			});

			describe('имеет корректный payload', () => {
				it('если ничего не было загружено', async () => {
					const subscribePromise = subscribe('onDataChange');

					await setProps({total: 0, chunkSize: 0});
					await expectAsync(subscribePromise).toBeResolvedTo({data: []});
				});

				it('после загрузки первого чанка', async () => {
					const subscribePromise = subscribe('onDataChange');

					await setProps({chunkSize: 12});
					await expectAsync(subscribePromise).toBeResolvedTo(firstChunkExpected);
				});

				it('после загрузки второго чанка', async () => {
					await setProps({chunkSize: 12});
					await h.dom.waitForEl(container, 'section');

					const subscribePromise = subscribe('onDataChange');

					await h.scroll.scrollToBottom(page);
					await expectAsync(subscribePromise).toBeResolvedTo(secondChunkExpected);
				});

				it('после переинициализации и загрузки первого чанка', async () => {
					await setProps({id: undefined});
					await h.dom.waitForEl(container, 'section');

					const subscribePromise = subscribe('onDataChange');

					await component.evaluate((ctx) => ctx.request = {get: {chunkSize: 6, id: 'uniq'}});

					await expectAsync(subscribePromise).toBeResolvedTo(firstChunkExpected);
				});

				it('после переинициализации и загрузки второго чанка', async () => {
					await setProps({id: undefined});
					await h.dom.waitForEl(container, 'section');

					await component.evaluate((ctx) => ctx.watch(':onDataChange', (val) => {
						ctx.tmp.currentCall = ctx.tmp.currentCall ?? 0;
						ctx.tmp[ctx.tmp.currentCall] = val;
						ctx.tmp.currentCall++;
					}));

					await component.evaluate((ctx) => ctx.request = {get: {chunkSize: 6, id: 'uniq'}});
					await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 1000});

					expect(await component.evaluate((ctx) => ctx.tmp[0])).toEqual(firstChunkExpected);

					await h.scroll.scrollToBottom(page);
					await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 1000});

					expect(await component.evaluate((ctx) => ctx.tmp[1])).toEqual(secondChunkExpected);
				});
			});
		});

		describe('chunkLoading', () => {

			describe('вызывается в начале', () => {
				// it('загрузки первого чанка', async () => {
				// 	// ...
				// });

				// it('загрузки второго чанка', async () => {
				// 	// ...
				// });

				// it('загрузки первого чанка после переинициализации', async () => {
				// 	// ...
				// });
			});
		});

		describe('chunkLoaded', () => {

			describe('вызывается', () => {
				// it('после первого похода в `dp`', async () => {
				// 	// ...
				// });

				// it('после второго похода в `dp`', async () => {
				// 	// ...
				// });

				// it('дважды если пришлось сходить несколько раз в `dp`', async () => {
				// 	// ...
				// });

				// it('после переинициализации и похода в `dp`', async () => {
				// 	// ...
				// });
			});

			describe('имеет корректный payload', () => {
				// it('после первого похода в `dp`', async () => {
				// 	// ...
				// });

				// it('после второго похода в `dp`', async () => {
				// 	// ...
				// });

				// it('при нескольких походах в `dp` для рендеринга одного чанка', async () => {
				// 	// ...
				// });
			});
		});

		describe('chunkLoadingError', () => {

			describe('вызывается', () => {
				// it('после ошибки запроса', async () => {
				// 	// ...
				// });
			});
		});

		describe('chunkRendered', () => {

			describe('вызывается', () => {
				// it('после отрисовки чанка', async () => {
				// 	// ...
				// });

				// it('на каждый из отрисованных чанков', async () => {
				// 	// ...
				// });
			});

			describe('имеет корректный payload', () => {
				// it('после отрисовки первого чанка', async () => {
				// 	// ...
				// });

				// it('после отрисовки второго чанка', async () => {
				// 	// ...
				// });
			});

		});

	});

};
