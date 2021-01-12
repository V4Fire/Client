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
	delay = require('delay'),
	h = include('tests/helpers');

/**
 * @param {Page} page
 */
module.exports = (page) => {
	const items = [
		{id: 'foo'},

		{
			id: 'bar',
			children: [
				{id: 'fooone'},
				{id: 'footwo'},

				{
					id: 'foothree',
					children: [{id: 'foothreeone'}]
				},

				{id: 'foofour'},
				{id: 'foofive'},
				{id: 'foosix'}
			]
		}
	];

	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-tree renders tree by passing item prop', () => {
		const init = async ({opts, attrs, content} = {}) => {
			if (opts == null) {
				opts = items;
			}

			await page.evaluate(({items, attrs, content}) => {
				globalThis.removeCreatedComponents();

				Object.forEach(content, (el, key) => {
					// eslint-disable-next-line no-new-func
					content[key] = /return /.test(el) ? Function(el)() : el;
				});

				Object.forEach(attrs, (el, key) => {
					// eslint-disable-next-line no-new-func
					attrs[key] = /return /.test(el) ? Function(el)() : el;
				});

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
			}, {items: opts, attrs, content});

			await h.bom.waitForIdleCallback(page);
			await h.component.waitForComponentStatus(page, '.b-tree', 'ready');
			return h.component.waitForComponent(page, '#target');
		};

		it('initialization', async () => {
			const
				target = await init();

			await expectAsync(target.evaluate((ctx) => ctx.isFunctional === false)).toBeResolvedTo(true);

			const
				promises = await Promise.all(checkOptionTree({opts: items, target})),
				checkboxes = await page.$$('.b-checkbox');

			expect(promises.length).toEqual(checkboxes.length);
		});

		it('set external renderFilter', async () => {
			await init({attrs: {
				renderChunks: 1,
				renderFilter: 'return () => new Promise((res) => setTimeout(() => res(true), 0.5.second()))'
			}});

			await h.bom.waitForIdleCallback(page);

			await delay(500);
			await expect((await page.$$('.b-checkbox')).length).toBe(1);

			await delay(500);
			await expect((await page.$$('.b-checkbox')).length).toBe(2);

			await delay(500);
			await expect((await page.$$('.b-checkbox')).length).toBe(3);
		});

		it('item unfolded by default', async () => {
			const opts = [
				{id: 'foo'},
				{
					id: 'bar',
					children: [
						{id: 'fooone'},
						{id: 'footwo'},
						{
							id: 'foothree',
							folded: false,
							children: [{id: 'foothreeone', children: [{id: 'foothreeoneone'}]}]
						}
					]
				}
			];

			const target = await init({opts});
			await Promise.all(checkOptionTree({opts, target}));
		});

		it('set external nestedRenderFilter', async () => {
			const opts = [
				{id: 'foo'},
				{
					id: 'bar',
					children: [
						{id: 'fooone'},
						{id: 'footwo'},
						{
							id: 'foothree',
							children: [{id: 'foothreeone', children: [{id: 'foothreeoneone'}]}]
						}
					]
				}
			];

			await init({
				opts,
				attrs: {
					renderChunks: 1,
					nestedRenderFilter: 'return () => new Promise((res) => setTimeout(() => res(true), 0.3.second()))'
				}
			});

			const wait = async (v, timer = 300) => {
				await delay(timer);
				await expect((await page.$$('.b-checkbox')).length).toBe(v);
			};

			await wait(2, 0);
			await wait(3);
			await wait(4);
			await wait(5);
			await wait(6);
			await wait(7);
		});
	});

	describe('b-tree renders items from a provider', () => {
		const init = async () => {
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

			await h.bom.waitForIdleCallback(page);
			await h.component.waitForComponentStatus(page, '.b-tree', 'ready');
			return h.component.waitForComponent(page, '#target');
		};

		it('initialization', async () => {
			await init();

			await h.bom.waitForIdleCallback(page);
			expect((await page.$$('.b-checkbox')).length).toBe(9);
		});
	});

	describe('b-tree renders tree by passing item through the default slot', () => {
		const init = async () => {
			await page.evaluate((items) => {
				const defaultSlot = {
					tag: 'div',
					attrs: {
						'data-test-ref': 'item'
					},
					content: 'Item'
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
			}, items);

			await h.bom.waitForIdleCallback(page);
			await h.component.waitForComponentStatus(page, '.b-tree', 'ready');

			return h.component.waitForComponent(page, '#target');
		};

		it('initialization', async () => {
			const
				target = await init();

			await expectAsync(target.evaluate((ctx) => ctx.isFunctional === false)).toBeResolvedTo(true);

			const
				promises = await Promise.all(checkOptionTree({opts: items, target})),
				refs = await h.dom.getRefs(page, 'item');

			expect(promises.length).toEqual(refs.length);
		});
	});

	function getFoldedClass(target, value = true) {
		return target.evaluate(
			(ctx, v) => ctx.block.getFullElName('node', 'folded', v),
			value
		);
	}

	function checkOptionTree({opts, target, queue = [], level = 0, foldSelector}) {
		opts.forEach((item) => {
			const
				isBranch = Object.isArray(item.children);

			queue.push((async () => {
				const
					id = await target.evaluate((ctx, id) => ctx.dom.getId(id), item.id),
					element = await h.dom.waitForEl(page, `[data-id="${id}"]`);

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
				checkOptionTree({opts: item.children, level: level + 1, target, queue, foldSelector});
			}
		});

		return queue;
	}
};
