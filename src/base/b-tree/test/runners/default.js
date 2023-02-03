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
	h = include('tests/helpers').default;

/**
 * Starts a test
 *
 * @param {Page} page
 * @returns {!Promise<void>}
 */
module.exports = (page) => {
	const defaultItems = [
		{value: 'bar'},

		{
			value: 'foo',
			children: [
				{value: 'foo_1'},
				{value: 'foo_2'},

				{
					value: 'foo_3',
					children: [{value: 'foo_3_1'}]
				},

				{value: 'foo_4'},
				{value: 'foo_5'},
				{value: 'foo_6'}
			]
		}
	];

	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-tree rendering data from the `items` prop', () => {
		it('initialization', async () => {
			const
				target = await init();

			await expectAsync(target.evaluate((ctx) => ctx.isFunctional === false))
				.toBeResolvedTo(true);

			await waitForItemsRender(9);

			const
				promises = await Promise.all(checkOptionTree({items: defaultItems, target})),
				checkboxes = await page.$$('.b-checkbox');

			expect(promises.length).toEqual(checkboxes.length);
		});

		it('all items unfolded by default', async () => {
			const items = [
				{value: 'bar'},

				{
					value: 'foo',
					children: [
						{value: 'foo_1'},
						{value: 'foo_2'},

						{
							value: 'foo_3',
							folded: false,
							children: [{value: 'foo_3_1', children: [{value: 'foo_3_1_1'}]}]
						}
					]
				}
			];

			const target = await init({items});
			await Promise.all(checkOptionTree({items, target}));
		});

		describe('setting of the external `renderFilter`', () => {
			it('renders by one with a timeout', async () => {
				const bTree = await init({attrs: {
					renderChunks: 1,
					renderFilter: 'return () => new Promise((res) => setTimeout(() => res(true), 0.5.second()))'
				}});

				await h.bom.waitForIdleCallback(page);

				const
					waitForRender = () => bTree.evaluate((ctx) => ctx.async.sleep(500)),
					getCheckboxes = () => page.$$('.b-checkbox');

				await waitForRender();
				await expect((await getCheckboxes()).length).toBe(1);

				await waitForRender();
				await expect((await getCheckboxes()).length).toBe(2);

				await waitForRender();
				await expect((await getCheckboxes()).length).toBe(3);
			});

			it('renders using the context data', async () => {
				await init({
					attrs: {renderFilter: `return (ctx, item) => {
							if (ctx.level === 0 ) {
								return true;
							}

							return false;
					}`}
				});

				await h.bom.waitForIdleCallback(page);

				await expect((await page.$$('.b-checkbox')).length).toBe(2);
			});
		});

		it('setting of the external `nestedRenderFilter`', async () => {
			const items = [
				{
					value: 'foo',
					children: [
						{value: 'foo_1'},
						{value: 'foo_2'},

						{
							value: 'foo_3',
							children: [{value: 'foo_3_1', children: [{value: 'foo_3_1_1'}]}]
						}
					]
				},

				{value: 'bar'}
			];

			await init({
				items,
				attrs: {
					renderChunks: 1,
					nestedRenderFilter: 'return () => new Promise((res) => setTimeout(() => res(true), 0.5.second()))'
				}
			});

			await waitForItemsRender(2);
			await waitForItemsRender(3);
			await waitForItemsRender(4);
			await waitForItemsRender(5);
			await waitForItemsRender(6);
			await waitForItemsRender(7);
		});

		async function init({items, attrs, content} = {}) {
			if (items == null) {
				items = defaultItems;
			}

			await page.evaluate(({items, attrs, content}) => {
				globalThis.removeCreatedComponents();

				parseParams(content);
				parseParams(attrs);

				const baseAttrs = {
					theme: 'demo',
					item: 'b-checkbox-functional',
					items,
					id: 'target',
					renderChunks: 2
				};

				const scheme = [
					{
						attrs: {
							...baseAttrs,
							...attrs
						},

						content
					}
				];

				globalThis.renderComponents('b-tree', scheme);

				function parseParams(obj) {
					Object.forEach(obj, (el, key) => {
						// eslint-disable-next-line no-new-func
						obj[key] = /return /.test(el) ? Function(el)() : el;
					});
				}
			}, {items, attrs, content});

			await h.component.waitForComponentStatus(page, '#target', 'ready');
			return h.component.waitForComponent(page, '#target');
		}
	});

	describe('b-tree rendering data from a data provider', () => {
		it('initialization', async () => {
			await init();
			await waitForItemsRender(14);
			await h.bom.waitForIdleCallback(page);

			expect((await page.$$('.b-checkbox')).length).toBe(14);
		});

		async function init() {
			await page.evaluate(() => {
				globalThis.removeCreatedComponents();

				const scheme = [
					{
						attrs: {
							theme: 'demo',
							dataProvider: 'demo.NestedList',
							item: 'b-checkbox-functional',
							id: 'target'
						}
					}
				];

				globalThis.renderComponents('b-tree', scheme);
			});

			await h.component.waitForComponentStatus(page, '.b-tree', 'ready');
			return h.component.waitForComponent(page, '#target');
		}
	});

	describe('b-tree providing of the `default` slot', () => {
		it('initialization', async () => {
			const
				target = await init();

			await expectAsync(target.evaluate((ctx) => ctx.isFunctional === false))
				.toBeResolvedTo(true);

			await waitForItemsRender(9, '[data-test-ref]');

			const
				promises = await Promise.all(checkOptionTree({items: defaultItems, target})),
				refs = await h.dom.getRefs(page, 'item');

			expect(promises.length).toEqual(refs.length);
		});

		async function init() {
			await page.evaluate((items) => {
				const defaultSlot = {
					tag: 'div',
					content: 'Item',
					attrs: {
						'data-test-ref': 'item'
					}
				};

				const scheme = [
					{
						attrs: {
							items,
							id: 'target',
							theme: 'demo'
						},

						content: {
							default: defaultSlot
						}
					}
				];

				globalThis.renderComponents('b-tree', scheme);
			}, defaultItems);

			await h.component.waitForComponentStatus(page, '#target', 'ready');
			return h.component.waitForComponent(page, '#target');
		}
	});

	describe('b-tree public API.', () => {
		const items = [
			{value: 0},
			{value: 1},
			{
				value: 2,
				children: [
					{
						value: 4,
						children: [{value: 5}]
					}
				]
			},
			{value: 3}
		];

		it('traverse', async () => {
			const
				target = await init();

			expect(
				await target.evaluate((ctx) => [...ctx.traverse()].map(([item]) => item.value))

			).toEqual([0, 1, 2, 3, 4, 5]);

			expect(
				await target.evaluate((ctx) => [...ctx.traverse(ctx, {deep: false})].map(([item]) => item.value))

			).toEqual([0, 1, 2, 3]);
		});

		it('fold/unfold', async () => {
			const
				target = await init();

			await expect(
				await target.evaluate(async (ctx) => {
					await ctx.unfold();

					return [
						ctx.getFoldedMod(2),
						ctx.getFoldedMod(4)
					];
				})
			).toEqual(['false', 'true']);

			await expect(
				await target.evaluate(async (ctx) => {
					await ctx.fold();

					return [
						ctx.getFoldedMod(2),
						ctx.getFoldedMod(4)
					];
				})
			).toEqual(['true', 'true']);

			await expect(
				await target.evaluate((ctx) => {
					ctx.unfold(4);

					return [
						ctx.getFoldedMod(2),
						ctx.getFoldedMod(4)
					];
				})
			).toEqual(['true', 'false']);
		});

		async function init() {
			await page.evaluate((items) => {
				const scheme = [
					{
						attrs: {
							items,
							id: 'target',
							theme: 'demo'
						}
					}
				];

				globalThis.renderComponents('b-tree', scheme);
			}, items);

			return h.component.waitForComponent(page, '#target');
		}
	});

	describe('items changed.', () => {
		it('default', async () => {
			const
				target = await init();

			expect(
				await target.evaluate(async (ctx) => {
					const
						log = [];

					ctx.on('onItemsChange', (val) => {
						log.push(val);
					});

					ctx.items = [{label: 'Bar', value: 1}];

					log.push(ctx.items);

					await ctx.nextTick();
					return log;
				})
			).toEqual([
				[{label: 'Bar', value: 1, mods: {id: 0, active: false}}],
				[{label: 'Bar', value: 1, mods: {id: 0, active: false}}]
			]);
		});

		it('folded false', async () => {
			const
				target = await init({folded: false});

			expect(
				await target.evaluate(async (ctx) => {
					ctx.items = [
						{value: 1},
						{
							value: 2,
							children: [{value: 4}]
						},
						{
							value: 3,
							children: [{value: 5}]
						}
					];

					await ctx.nextTick();
					return [ctx.getFoldedMod(2), ctx.getFoldedMod(3)];
				})
			).toEqual(['false', 'false']);
		});

		it('node is folded after change', async () => {
			const
				target = await init();

			expect(
				await target.evaluate(async (ctx) => {
					await ctx.fold('foo');

					ctx.items = [
						{value: 1},
						{
							value: 2,
							children: [{value: 4}]
						},
						{
							value: 3,
							children: [{value: 5}]
						}
					];

					await ctx.nextTick();
					return ctx.getFoldedMod(2);
				})
			).toBe('true');
		});

		async function init(attrs) {
			await page.evaluate(([items, attrs]) => {
				const scheme = [
					{
						attrs: {
							items,
							id: 'target',
							theme: 'demo',
							...attrs
						}
					}
				];

				globalThis.renderComponents('b-tree', scheme);
			}, [defaultItems, attrs]);

			return h.component.waitForComponent(page, '#target');
		}
	});

	async function waitForItemsRender(v, selector = '.b-checkbox') {
		await page.waitForFunction(([v, selector]) => document.querySelectorAll(selector).length === v, [v, selector]);
		await expect((await page.$$(selector)).length).toBe(v);
	}

	function getFoldedClass(target, value = true) {
		return target.evaluate(
			(ctx, v) => ctx.block.getFullElName('node', 'folded', v),
			value
		);
	}

	function checkOptionTree({items, target, queue = [], level = 0, foldSelector}) {
		items.forEach((item) => {
			const
				isBranch = Object.isArray(item.children);

			queue.push((async () => {
				const
					id = await target.evaluate((ctx, value) => ctx.values.get(value), item.value),
					element = await h.dom.waitForEl(page, `[data-id="${id}"]`);

				await expect(await element.getAttribute('data-level')).toBe(String(level));

				const
					foldedPropValue = await target.evaluate((ctx) => ctx.folded),
					foldedInitModValue = item.folded != null ? item.folded : foldedPropValue,
					foldedClass = await getFoldedClass(target, foldedInitModValue);

				if (isBranch) {
					const
						selector = foldSelector || await target.evaluate((ctx) => `.${ctx.block.getFullElName('fold')}`),
						fold = await h.dom.waitForEl(element, selector);

					await expectAsync(
						element.getAttribute('class').then((className) => className.includes(foldedClass))
					).toBeResolvedTo(true);

					if (foldedInitModValue) {
						await fold.click();
					}
				}
			})());

			if (isBranch) {
				checkOptionTree({
					items: item.children,
					level: level + 1,
					target,
					queue,
					foldSelector
				});
			}
		});

		return queue;
	}
};
