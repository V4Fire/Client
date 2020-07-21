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

	const subscribe = () => component.evaluate((ctx) => new Promise((res) => ctx.watch(':onChunkLoading', res)));

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
				await expectAsync(subscribePromise).toBeResolvedTo(0);
			});

			it('при загрузке второго чанка', async () => {
				await setProps();
				await h.dom.waitForEl(container, 'section');

				const subscribePromise = subscribe();

				await h.scroll.scrollToBottom(page);
				await expectAsync(subscribePromise).toBeResolvedTo(1);
			});

			it('при загрузке первого чанка после переинициализации', async () => {
				await setProps();
				await h.dom.waitForEl(container, 'section');

				const subscribePromise = subscribe();
				await setProps({id: 'new-id'});

				await expectAsync(subscribePromise).toBeResolvedTo(0);
			});

			it('три раза при загрузке полного чанка', async () => {
				await component.evaluate((ctx) => ctx.watch(':onChunkLoading', (val) => {
					ctx.tmp.currentCall = (ctx.tmp.currentCall ?? 0) + 1;
					ctx.tmp[ctx.tmp.currentCall] = val;
				}));

				await setProps({chunkSize: 4});
				await h.dom.waitForEl(container, 'section');

				expect(await component.evaluate((ctx) => ctx.tmp.currentCall)).toBe(3);
				expect(await component.evaluate((ctx) => [ctx.tmp[1], ctx.tmp[2], ctx.tmp[3]])).toEqual([0, 1, 2]);
			});
		});
	});
};
