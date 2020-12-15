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

	const checkOptionTree = ({opts, target, queue = [], level = 0}) => {
		opts.forEach((option) => {
			if (Object.isArray(option.children)) {
				checkOptionTree({opts: option.children, level: level + 1, target, queue});
			}

			queue.push((async () => {
				const
					id = await target.evaluate((ctx, id) => ctx.dom.getId(id), option.id),
					foldedClass = await getFoldedClass(target),
					element = await h.dom.waitForEl(page, `[data-id="${id}"]`);

				await expectAsync(
					element.getAttribute('class').then((className) => className.includes(foldedClass))
				).toBeResolvedTo(true);

				await expectAsync(element.getAttribute('data-level')).toBeResolvedTo(String(level));
			})());
		});

		return queue;
	};

	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-tree renders tree by passing option prop', () => {
		const init = async () => {
			await page.evaluate((options) => {
				globalThis.removeCreatedComponents();

				const baseAttrs = {
					theme: 'demo',
					option: 'b-checkbox-functional',
					options,
					renderChunks: 2
				};

				const scheme = [
					{
						attrs: {
							...baseAttrs,
							id: 'target'
						}
					}
				];

				globalThis.renderComponents('b-tree', scheme);
				globalThis.componentNode = document.querySelector('.b-tree');
			}, options);

			await h.bom.waitForIdleCallback(page);
			await h.component.waitForComponentStatus(page, '.b-tree', 'ready');

			return h.component.waitForComponent(page, '#target');
		};

		it('initialization', async () => {
			const
				target = await init();

			await expectAsync(target.evaluate((ctx) => ctx.isFunctional === false)).toBeResolvedTo(true);
			await Promise.all(checkOptionTree({opts: options, target}));
		});

		it('branch folding', async () => {
			const
				target = await init();

			const
				id = await target.evaluate((ctx, id) => ctx.dom.getId(id), options[1].id),
				foldClass = await target.evaluate((ctx) => ctx.block.getFullElName('fold')),
				element = await h.dom.waitForEl(page, `[data-id="${id}"]`),
				fold = await h.dom.waitForEl(element, `.${foldClass}`);

			fold.click();

			const
				mod = await getFoldedClass(target, false);

			await h.bom.waitForIdleCallback(page);

			await expectAsync(
				element.getAttribute('class').then((className) => className.includes(mod))
			).toBeResolvedTo(true);
		});
	});

	describe('b-tree renders tree by passing item through the default slot', () => {
		const init = async () => {
			await page.evaluate((options) => {
				const defaultSlot = {
					tag: 'div',
					attrs: {
						'data-test-ref': 'default'
					},
					content: 'Empty'
				};

				const scheme = [
					{
						attrs: {
							options,
							id: 'target'
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
			await Promise.all(checkOptionTree({opts: options, target}));
		});
	});
};
