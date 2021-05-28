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
 * Starts a test
 *
 * @param {Page} page
 * @param {!Object} params
 * @returns {!Promise<void>}
 */
module.exports = async (page, params) => {
	await h.utils.setup(page, params.context);

	const defaultItems = [
		{id: 'bar'},

		{
			id: 'foo',
			children: [
				{id: 'foo_1'},
				{id: 'foo_2'},

				{
					id: 'foo_3',
					children: [{id: 'foo_3_1'}]
				},

				{id: 'foo_4'},
				{id: 'foo_5'},
				{id: 'foo_6'}
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

			const
				promises = await Promise.all(checkOptionTree({items: defaultItems, target})),
				checkboxes = await page.$$('.b-checkbox');

			expect(promises.length).toEqual(checkboxes.length);
		});

		it('all items unfolded by default', async () => {
			const items = [
				{id: 'bar'},

				{
					id: 'foo',
					children: [
						{id: 'foo_1'},
						{id: 'foo_2'},

						{
							id: 'foo_3',
							folded: false,
							children: [{id: 'foo_3_1', children: [{id: 'foo_3_1_1'}]}]
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
					id: 'foo',
					children: [
						{id: 'foo_1'},
						{id: 'foo_2'},

						{
							id: 'foo_3',
							children: [{id: 'foo_3_1', children: [{id: 'foo_3_1_1'}]}]
						}
					]
				},

				{id: 'bar'}
			];

			await init({
				items,
				attrs: {
					renderChunks: 1,
					nestedRenderFilter: 'return () => new Promise((res) => setTimeout(() => res(true), 0.5.second()))'
				}
			});

			await waitForCheckboxCount(2);
			await waitForCheckboxCount(3);
			await waitForCheckboxCount(4);
			await waitForCheckboxCount(5);
			await waitForCheckboxCount(6);
			await waitForCheckboxCount(7);
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

			return h.component.waitForComponent(page, '#target');
		}
	});

	describe('b-tree rendering data from a data provider', () => {
		it('initialization', async () => {
			await init();
			await waitForCheckboxCount(14);
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

			return h.component.waitForComponent(page, '#target');
		}
	});

	async function waitForCheckboxCount(v) {
		await page.waitForFunction((v) => document.querySelectorAll('.b-checkbox').length === v, v);
		await expect((await page.$$('.b-checkbox')).length).toBe(v);
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
					element = await h.dom.waitForEl(page, `[data-id$="-${item.id}"]`);

				const
					foldedPropValue = await target.evaluate((ctx) => ctx.folded),
					foldedInitModValue = item.folded != null ? item.folded : foldedPropValue,
					foldedClass = await getFoldedClass(target, foldedInitModValue);

				await expectAsync(
					element.getAttribute('class').then((className) => className.includes(foldedClass))
				).toBeResolvedTo(true);

				await expectAsync(element.getAttribute('data-level')).toBeResolvedTo(String(level));

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
