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
	const
		textSlotContent = 'Lorem Ipsum';

	const swipeOnce = async () => {
		const
			selector = h.dom.elNameGenerator('.b-slider', 'window'),
			el = await h.dom.waitForEl(page, selector);

		const create = (clientX, selector) => page.evaluateHandle(({clientX, selector}) => ({
			touches: [
				new Touch({
					clientX,
					target: document.querySelector(selector),
					identifier: Math.random()
				})
			]
		}), {clientX, selector});

		el.dispatchEvent('touchstart', await create(220, selector));
		el.dispatchEvent('touchmove', await create(120, selector));
		el.dispatchEvent('touchend', await create(0, selector));
	};

	beforeAll(async () => {
		globalThis.jasmine.DEFAULT_TIMEOUT_INTERVAL = (50).second();
		await page.setViewportSize({width: 480, height: 640});
	});

	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	const init = async ({attrs, content} = {}) => {
		await page.evaluate(({attrs, content}) => {
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
				id: 'target'
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

			globalThis.renderComponents('b-slider', scheme);
		}, {attrs, content});

		await h.bom.waitForIdleCallback(page);
		await h.component.waitForComponentStatus(page, '.b-slider', 'ready');
		return h.component.waitForComponent(page, '#target');
	};

	describe('b-slider providing of slots', () => {
		const defaultSlotFn = () => {
			const items = [1, 2, 3, 4].map((i) => ({
				tag: 'img',
				data: {
					attrs: {
						'data-test-ref': 'item',
						id: `slide${i}`,
						src: `https://picsum.photos/300/200.jpg?random=${i}`,
						width: 300,
						height: 200
					}
				}
			}));

			return `return () => ${JSON.stringify(items)}`;
		};

		it('default slot with slider mode "slide"', async () => {
			const
				target = await init({content: {default: defaultSlotFn()}, attrs: {mode: 'slide'}}),
				viewContent = await h.dom.waitForEl(page, h.dom.elNameGenerator('.b-slider', 'view-content'));

			await h.bom.waitForIdleCallback(page);

			expect((await target.evaluate((ctx) => ctx.contentLength))).toBe(4);
			expect((await h.dom.getRefs(viewContent, 'item')).length).toBe(4);

			await swipeOnce();
			expect((await target.evaluate((ctx) => ctx.current))).toBe(1);
		});

		it('default slot with slider mode "scroll"', async () => {
			const
				target = await init({content: {default: defaultSlotFn()}, attrs: {mode: 'scroll'}}),
				viewContent = await h.dom.waitForEl(page, h.dom.elNameGenerator('.b-slider', 'view-content'));

			await h.bom.waitForIdleCallback(page);

			expect((await target.evaluate((ctx) => ctx.contentLength))).toBe(4);
			expect((await h.dom.getRefs(viewContent, 'item')).length).toBe(4);

			await target.evaluate((ctx) => ctx.$refs.contentWrapper.scrollTo({left: 120}));

			expect(await target.evaluate((ctx) => ctx.currentOffset)).toBe(120);
		});

		it('"before" slot', async () => {
			const
				w = h.dom.elNameGenerator('.b-slider', 'window');

			const
				target = await init({content: {default: defaultSlotFn(), before: `return () => "${textSlotContent}"`}});

			const text = await target.evaluate(
				(ctx, selector) => ctx.$el.querySelector(selector).previousSibling.wholeText.trim(), w
			);

			expect(text).toEqual(textSlotContent);
		});

		it('"after" slot', async () => {
			const
				w = h.dom.elNameGenerator('.b-slider', 'window');

			const
				target = await init({content: {default: defaultSlotFn(), after: `return () => "${textSlotContent}"`}});

			const text = await target.evaluate(
				(ctx, selector) => ctx.$el.querySelector(selector).nextSibling.wholeText.trim(), w
			);

			expect(text).toEqual(textSlotContent);
		});

		it('"beforeItems" slot', async () => {
			const
				w = h.dom.elNameGenerator('.b-slider', 'view-content');

			const target = await init({
				attrs: {
					item: 'b-checkbox',
					items: [{id: '1'}, {id: '2'}]
				},
				content: {
					beforeItems: `return () => "${textSlotContent}"`
				}
			});

			const text = await target.evaluate(
				(ctx, selector) => ctx.$el.querySelector(selector).firstChild.wholeText.trim(), w
			);

			expect(text).toEqual(textSlotContent);
		});

		it('"afterItems" slot', async () => {
			const
				w = h.dom.elNameGenerator('.b-slider', 'view-content');

			const target = await init({
				attrs: {
					item: 'b-checkbox',
					items: [{id: '1'}, {id: '2'}]
				},
				content: {
					afterItems: `return () => "${textSlotContent}"`
				}
			});

			const text = await target.evaluate(
				(ctx, selector) => ctx.$el.querySelector(selector).lastChild.wholeText.trim(), w
			);

			expect(text).toEqual(textSlotContent);
		});
	});
};
