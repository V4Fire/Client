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

	const subscribe = () => component.evaluate((ctx) => new Promise((res) => ctx.watch(':onChunkLoading', res)));

	const setProps = (requestProps = {}) => component.evaluate((ctx, requestProps) => {
		ctx.dataProvider = 'demo.Pagination';
		ctx.chunkSize = 10;
		ctx.request = {get: {chunkSize: 12, id: Math.random(), ...requestProps}};
	}, requestProps);

	describe('b-virtual-scroll `chunkLoading` event', () => {
		describe('emitted', () => {
			it('when loading the first chunk', async () => {
				const subscribePromise = subscribe();

				await setProps();
				await expectAsync(subscribePromise).toBeResolvedTo(0);
			});

			it('when loading the second chunk', async () => {
				await setProps();
				await h.dom.waitForEl(container, 'section');

				const subscribePromise = subscribe();

				await h.scroll.scrollToBottom(page);
				await expectAsync(subscribePromise).toBeResolvedTo(1);
			});

			it('when loading the first chunk after re-initialization', async () => {
				await setProps();
				await h.dom.waitForEl(container, 'section');

				const subscribePromise = subscribe();
				await setProps({id: Math.random()});

				await expectAsync(subscribePromise).toBeResolvedTo(0);
			});

			it('three times when loading a full chunk', async () => {
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
