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

	const checkOptionTree = ({opts, target, queue = [], level = 0}) => {
		opts.forEach((option) => {
			if (Object.isArray(option.children)) {
				checkOptionTree({opts: option.children, level: level + 1, target, queue});
			}

			queue.push((async () => {
				const
					id = await target.evaluate((ctx, id) => ctx.dom.getId(id), option.id),
					foldedClass = await target.evaluate((ctx) => ctx.block.getFullElName('matryoshka', 'folded', true)),
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

	describe('b-matryoshka renders controls tree by passing option prop', () => {
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

				globalThis.renderComponents('b-matryoshka', scheme);
				globalThis.componentNode = document.querySelector('.b-matryoshka');
			}, options);

			await h.bom.waitForIdleCallback(page);
			await h.component.waitForComponentStatus(page, '.b-matryoshka', 'ready');

			return h.component.waitForComponent(page, '#target');
		};

		it('initialization', async () => {
			const
				target = await init();

			await expectAsync(target.evaluate((ctx) => ctx.isFunctional === false)).toBeResolvedTo(true);
			await Promise.all(checkOptionTree({opts: options, target}));
		});
	});

	describe('b-matryoshka renders controls tree by passing items through slot', () => {
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

				globalThis.renderComponents('b-matryoshka', scheme);
			}, options);

			await h.bom.waitForIdleCallback(page);
			await h.component.waitForComponentStatus(page, '.b-matryoshka', 'ready');

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
