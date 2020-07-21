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
		getArray = (offset = 0, length = 12) => ({data: Array.from(Array(length), (v, i) => ({i: i + offset}))}),
		firstChunkExpected = getArray();

	const setProps = (requestProps = {}) => component.evaluate((ctx, requestProps) => {
		ctx.dataProvider = 'demo.Pagination';
		ctx.chunkSize = 10;
		ctx.request = {get: {chunkSize: 12, id: 'uniq', ...requestProps}};
	}, requestProps);

	const subscribe = () => component.evaluate((ctx) => new Promise((res) => ctx.watch(':onDBChange', res)));

	beforeEach(async () => {
		await h.utils.reloadAndWaitForIdle(page);

		component = await h.component.waitForComponent(page, '#target');
		node = await h.dom.waitForEl(page, '#target');
		container = await h.dom.waitForRef(node, 'container');
	});

	describe('b-virtual-scroll dbChange', () => {
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
					ctx.watch(':onDBChange', () => {
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
		});

		describe('не вызывается', () => {
			it('если произошла ошибка загрузка', async () => {
				await component.evaluate((ctx) => {
					ctx.watch(':onDBChange', () => {
						ctx.tmp.called = (ctx.tmp.called ?? 0) + 1;
					});
				});

				await setProps({failOn: 0});
				await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 500});

				expect(await component.evaluate((ctx) => ctx.tmp.called)).toBeUndefined();
			});

			it('при успешной загрузки второго чанка без payload', async () => {
				await setProps({chunkSize: 12, total: 12});
				await h.dom.waitForEl(container, 'section');

				await component.evaluate((ctx) => {
					ctx.watch(':onDBChange', () => {
						ctx.tmp.called = (ctx.tmp.called ?? 0) + 1;
					});
				});

				await h.scroll.scrollToBottom(page);
				expect(await component.evaluate((ctx) => ctx.tmp.called)).toBeUndefined();
			});
		});

		describe('имеет корректный payload', () => {
			it('после первой загрузки', async () => {
				const subscribePromise = subscribe();

				await setProps({chunkSize: 4});
				await h.dom.waitForEl(container, 'section');

				await expectAsync(subscribePromise).toBeResolvedTo(getArray(0, 4));
			});

			it('после загрузки двух чанков', async () => {
				await component.evaluate((ctx) => {
					ctx.watch(':onDBChange', (val) => {
						ctx.tmp.called = (ctx.tmp.called ?? 0) + 1;
						ctx.tmp[ctx.tmp.called] = Object.fastClone(val);
					});
				});

				await setProps({chunkSize: 6});
				await h.dom.waitForEl(container, 'section');

				expect(await component.evaluate((ctx) => ctx.tmp[1])).toEqual(getArray(0, 6));
				expect(await component.evaluate((ctx) => ctx.tmp[2])).toEqual(getArray(0, 12));

			});

			it('после переинициализации и загрузки первого чанка', async () => {
				await setProps({chunkSize: 6});
				await h.dom.waitForEl(container, 'section');

				const subscribePromise = subscribe();

				await setProps({chunkSize: 12, id: 'new-id'});
				await expectAsync(subscribePromise).toBeResolvedTo(firstChunkExpected);
			});
		});
	});
};
