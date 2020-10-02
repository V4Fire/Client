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
		getContainerChildCount = () => component.evaluate((ctx) => ctx.$refs.container.childElementCount);

	const setProps = async (reqParams) => {
		await component.evaluate((ctx, reqParams) => {
			ctx.dataProvider = 'demo.Pagination';
			ctx.chunkSize = 10;
			ctx.request = {get: {chunkSize: 10, id: Math.random(), ...reqParams}};
		}, reqParams);

		await h.dom.waitForEl(container, 'section');
	};

	const
		initialTimeout = globalThis.jasmine.DEFAULT_TIMEOUT_INTERVAL;

	beforeAll(() => {
		globalThis.jasmine.DEFAULT_TIMEOUT_INTERVAL = (20).seconds();
	});

	afterAll(() => {
		globalThis.jasmine.DEFAULT_TIMEOUT_INTERVAL = initialTimeout;
	});

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
			globalThis.componentNode = document.querySelector('.b-virtual-scroll');
		});

		await h.bom.waitForIdleCallback(page);
		await h.component.waitForComponentStatus(page, '.b-virtual-scroll', 'ready');

		node = await h.dom.waitForEl(page, '#target');
		component = await h.component.waitForComponent(page, '#target');
		container = await h.dom.waitForRef(node, 'container');
	});

	describe('b-virtual-scroll rendering', () => {
		describe('after re-initialization', () => {
			describe('by changing the `request` prop', () => {
				it('removes old elements', async () => {
					await setProps();

					await component.evaluate((ctx) => ctx.request = {get: {chunkSize: 10, total: 0}});
					await h.dom.waitForEl(container, 'section', {to: 'unmount'});

					expect(await component.evaluate((ctx) => ctx.$refs.container.childElementCount === 0)).toBeTrue();
				});

				it('renders new', async () => {
					await setProps();

					const
						chunkSize = await component.evaluate((ctx) => ctx.requestParams.get.chunkSize);

					expect(await getContainerChildCount()).toBe(chunkSize);

					await component.evaluate((ctx) => ctx.request = {get: {chunkSize: 4, total: 4, id: 'uniq-options'}});

					await h.dom.waitForEl(container, 'section', {to: 'unmount'});
					await h.dom.waitForEl(container, 'section');

					const
						newChunkSize = await component.evaluate((ctx) => ctx.requestParams.get.chunkSize);

					expect(await getContainerChildCount()).toBe(newChunkSize);
				});
			});

			describe('by changing the `request` prop while second data batch loading is in progress', () => {
				it('should render first chunk with correct data', async () => {
					await component.evaluate((ctx) => {
						ctx.dataProvider = 'demo.Pagination';
						ctx.chunkSize = 2;
						ctx.request = {get: {chunkSize: 2, delay: 1500, id: Math.random()}};
					});

					await h.dom.waitForEl(container, 'section');

					await component.evaluate((ctx) => {
						ctx.dataProvider = 'demo.Pagination';
						ctx.chunkSize = 2;
						ctx.request = {get: {chunkSize: 2, i: 10, total: 2, delay: 1500, id: Math.random()}};
					});

					expect(await h.dom.waitForEl(container, '[data-index="10"]'));
					expect(await getContainerChildCount()).toBe(2);
				});
			});

			describe('by changing the `dataProvider` prop', () => {
				it('removes old elements', async () => {
					await setProps();

					await component.evaluate((ctx) => ctx.dataProvider = undefined);
					await h.dom.waitForEl(container, 'section', {to: 'unmount'});

					expect(await component.evaluate((ctx) => ctx.$refs.container.childElementCount === 0)).toBeTrue();
				});

				it('renders new', async () => {
					await h.dom.waitForEl(container, 'section', {to: 'unmount'});
					expect(await component.evaluate((ctx) => ctx.$refs.container.childElementCount === 0)).toBeTrue();

					await component.evaluate((ctx) => ctx.dataProvider = 'demo.Pagination');
					await h.dom.waitForEl(container, 'section');

					expect(await getContainerChildCount()).toBeGreaterThan(0);
				});
			});
		});

		describe('with `options`', () => {
			it('renders the first chunk', async () => {
				const
					chunkSize = await component.evaluate((ctx) => ctx.chunkSize);

				await component.evaluate((ctx) => ctx.options = Array.from(Array(40), (v, i) => ({i})));
				await h.dom.waitForEl(container, 'section');

				expect(await getContainerChildCount()).toBe(chunkSize);
			});

			it('renders all available `options`', async () => {
				await component.evaluate((ctx) => ctx.options = Array.from(Array(40), (v, i) => ({i})));
				await h.dom.waitForEl(container, 'section');

				const
					total = await component.evaluate((ctx) => ctx.options.length),
					checkFn = async () => await getContainerChildCount() === total;

				await h.scroll.scrollToBottomWhile(page, checkFn, {timeout: 1e5});
				expect(await getContainerChildCount()).toBe(total);
			});

			it('does not render more than received data', async () => {
				await component.evaluate((ctx) => ctx.options = Array.from(Array(40), (v, i) => ({i})));
				await h.dom.waitForEl(container, 'section');

				const
					total = await component.evaluate((ctx) => ctx.options.length),
					checkFn = async () => await getContainerChildCount() === total;

				await h.scroll.scrollToBottomWhile(page, checkFn, {timeout: 1e5});
				expect(await getContainerChildCount()).toBe(total);

				await h.bom.waitForIdleCallback(page);
				await h.scroll.scrollToBottom(page);
				expect(await getContainerChildCount()).toBe(total);
			});
		});

		describe('with `dataProvider`', () => {
			it('renders the first chunk', async () => {
				await setProps();

				const
					chunkSize = await component.evaluate((ctx) => ctx.chunkSize);

				expect(await getContainerChildCount()).toBe(chunkSize);
			});

			it('renders all available items', async () => {
				await setProps({total: 40});

				const
					total = await component.evaluate((ctx) => ctx.requestParams.get.total),
					checkFn = async () => await getContainerChildCount() === total;

				await h.scroll.scrollToBottomWhile(page, checkFn, {timeout: 1e5});

				expect(await getContainerChildCount()).toBe(total);
			});

			it('does not render more than received data', async () => {
				await setProps({total: 40});

				const
					total = await component.evaluate((ctx) => ctx.requestParams.get.total),
					checkFn = async () => await getContainerChildCount() === total;

				await h.scroll.scrollToBottomWhile(page, checkFn, {timeout: 1e5});
				expect(await getContainerChildCount()).toBe(total);

				await h.bom.waitForIdleCallback(page);
				await h.scroll.scrollToBottom(page);
				expect(await getContainerChildCount()).toBe(total);
			});

			it('renders the first chunk with 3 requests to get the full chunk', async () => {
				await setProps({chunkSize: 4});

				const
					chunkSize = await component.evaluate((ctx) => ctx.chunkSize);

				await h.dom.waitForEl(container, 'section');

				expect(await getContainerChildCount()).toBe(chunkSize);
			});

			it('renders the first chunk with truncated data in all loaded chunks', async () => {
				await component.evaluate((ctx) => {
					ctx.dataProvider = 'demo.Pagination';
					ctx.chunkSize = 4;
					ctx.request = {get: {chunkSize: 8, total: 32, id: 'uniq'}};
					ctx.dbConverter = ({data}) => ({data: data.splice(0, 1)});
				});

				const
					chunkSize = await component.evaluate((ctx) => ctx.chunkSize);

				await h.dom.waitForEl(container, 'section');

				expect(await getContainerChildCount()).toBe(chunkSize);
			});

			it('renders all data if `shouldStopRequest` returns true', async () => {
				await component.evaluate((ctx) => {
					ctx.dataProvider = 'demo.Pagination';
					ctx.chunkSize = 10;
					ctx.request = {get: {chunkSize: 40, total: 80, id: Math.random(), delay: 100}};
					ctx.shouldStopRequest = ({data}) => data.length === 80;
				});

				const
					checkFn = async () => await getContainerChildCount() === 80;

				await h.scroll.scrollToBottomWhile(page, checkFn, {timeout: 1e5});
				expect(await getContainerChildCount()).toBe(80);
			});
		});

		describe('without `options` and` dataProvider` specified', () => {
			it('does not render anything', async () => {
				expect(await component.evaluate((ctx) => ctx.options.length === 0)).toBeTrue();
				expect(await component.evaluate((ctx) => ctx.dataProvider === undefined)).toBeTrue();
				expect(await component.evaluate((ctx) => ctx.$refs.container.childElementCount === 0)).toBeTrue();
			});
		});
	});
};
