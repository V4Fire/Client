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
	const options = [
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

	const getFoldedClass = (target, value = true) => target.evaluate(
		(ctx, v) => ctx.block.getFullElName('node', 'folded', v),
		value
	);

	const checkOptionTree = ({opts, target, queue = [], level = 0, foldSelector}) => {
		opts.forEach((option) => {
			const
				isBranch = Object.isArray(option.children);

			queue.push((async () => {
				const
					id = await target.evaluate((ctx, id) => ctx.dom.getId(id), option.id),
					foldedClass = await getFoldedClass(target),
					element = await h.dom.waitForEl(page, `[data-id="${id}"]`);

				await expectAsync(
					element.getAttribute('class').then((className) => className.includes(foldedClass))
				).toBeResolvedTo(true);

				await expectAsync(element.getAttribute('data-level')).toBeResolvedTo(String(level));

				if (isBranch) {
					const
						selector = foldSelector || await target.evaluate((ctx) => `.${ctx.block.getFullElName('fold')}`),
						fold = await h.dom.waitForEl(element, selector);

					fold.click();

					const
						mod = await getFoldedClass(target, false);

					await h.bom.waitForIdleCallback(page);

					await expectAsync(
						element.getAttribute('class').then((className) => className.includes(mod))
					).toBeResolvedTo(true);
				}
			})());

			if (isBranch) {
				checkOptionTree({opts: option.children, level: level + 1, target, queue, foldSelector});
			}
		});

		return queue;
	};

	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-tree renders tree by passing option prop', () => {
		const init = async ({opts, attrs, content} = {}) => {
			if (opts == null) {
				opts = options;
			}

			await page.evaluate(({options, attrs, content}) => {
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
					option: 'b-checkbox-functional',
					options,
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
			}, {options: opts, attrs, content});

			await h.bom.waitForIdleCallback(page);
			await h.component.waitForComponentStatus(page, '.b-tree', 'ready');
			return h.component.waitForComponent(page, '#target');
		};

		it('initialization', async () => {
			const
				target = await init();

			await expectAsync(target.evaluate((ctx) => ctx.isFunctional === false)).toBeResolvedTo(true);

			const
				promises = await Promise.all(checkOptionTree({opts: options, target})),
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
							children: [
								{
									id: 'foothreeone',
									children: [
										{
											id: 'foothreeoneone'
										}
									]
								}
							]
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

	describe('b-tree renders tree by passing item through the default slot', () => {
		const init = async () => {
			await page.evaluate((options) => {
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
							options,
							id: 'target',
							theme: 'demo'
						},

						content: {
							default: defaultSlot
						}
					}
				];

				globalThis.renderComponents('b-tree', scheme);
			}, options);

			await h.bom.waitForIdleCallback(page);
			await h.component.waitForComponentStatus(page, '.b-tree', 'ready');

			return h.component.waitForComponent(page, '#target');
		};

		it('initialization', async () => {
			const
				target = await init();

			await expectAsync(target.evaluate((ctx) => ctx.isFunctional === false)).toBeResolvedTo(true);

			const
				promises = await Promise.all(checkOptionTree({opts: options, target})),
				refs = await h.dom.getRefs(page, 'item');

			expect(promises.length).toEqual(refs.length);
		});
	});
};
