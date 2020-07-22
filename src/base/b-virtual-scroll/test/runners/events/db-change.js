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
		describe('called', () => {
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

			it('after loading the first chunk after re-initialization', async () => {
				await setProps();
				await h.dom.waitForEl(container, 'section');

				const subscribePromise = subscribe();

				await component.evaluate((ctx) => ctx.request = {get: {chunkSize: 20}});
				await expectAsync(subscribePromise).toBeResolved();
			});

			it('three times to get a full data batch', async () => {
				await component.evaluate((ctx) => {
					ctx.watch(':onDBChange', () => {
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
		});

		describe('not called', () => {
			it('if there was a request error', async () => {
				await component.evaluate((ctx) => {
					ctx.watch(':onDBChange', () => {
						ctx.tmp.called = (ctx.tmp.called ?? 0) + 1;
					});
				});

				await setProps({failOn: 0});
				await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 500});

				expect(await component.evaluate((ctx) => ctx.tmp.called)).toBeUndefined();
			});

			it('after successful loading of the second chunk without payload', async () => {
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

		describe('has correct payload', () => {
			it('after loading the first chunk', async () => {
				const subscribePromise = subscribe();

				await setProps({chunkSize: 4});
				await h.dom.waitForEl(container, 'section');

				await expectAsync(subscribePromise).toBeResolvedTo(getArray(0, 4));
			});

			it('after loading two chunks', async () => {
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

			it('after re-initialization and loading the first chunk', async () => {
				await setProps({chunkSize: 6});
				await h.dom.waitForEl(container, 'section');

				const subscribePromise = subscribe();

				await setProps({chunkSize: 12, id: 'new-id'});
				await expectAsync(subscribePromise).toBeResolvedTo(firstChunkExpected);
			});
		});
	});
};
