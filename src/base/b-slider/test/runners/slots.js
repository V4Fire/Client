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
	h = include('tests/helpers'),
	{swipeOnce, initSlider} = include('src/base/b-slider/test/helpers');

/**
 * @param {Page} page
 */
module.exports = (page) => {
	const
		textSlotContent = 'Lorem Ipsum';

	beforeAll(async () => {
		await page.setViewportSize({width: 480, height: 640});
	});

	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

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

		it('default slot with a slider mode "slide"', async () => {
			const
				target = await initSlider(page, {content: {default: defaultSlotFn()}, attrs: {mode: 'slide'}}),
				viewContent = await h.dom.waitForEl(page, h.dom.elNameGenerator('.b-slider', 'view-content'));

			await h.bom.waitForIdleCallback(page);

			expect((await target.evaluate((ctx) => ctx.contentLength))).toBe(4);
			expect((await h.dom.getRefs(viewContent, 'item')).length).toBe(4);

			await swipeOnce(page);
			await h.bom.waitForIdleCallback(page);
			expect((await target.evaluate((ctx) => ctx.current))).toBe(1);
		});

		it('default slot with a slider mode "scroll"', async () => {
			const
				target = await initSlider(page, {content: {default: defaultSlotFn()}, attrs: {mode: 'scroll'}}),
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
				target = await initSlider(page, {content: {default: defaultSlotFn(), before: `return () => "${textSlotContent}"`}});

			const text = await target.evaluate(
				(ctx, selector) => ctx.$el.querySelector(selector).previousSibling.wholeText.trim(), w
			);

			expect(text).toEqual(textSlotContent);
		});

		it('"after" slot', async () => {
			const
				w = h.dom.elNameGenerator('.b-slider', 'window');

			const
				target = await initSlider(page, {content: {default: defaultSlotFn(), after: `return () => "${textSlotContent}"`}});

			const text = await target.evaluate(
				(ctx, selector) => ctx.$el.querySelector(selector).nextSibling.wholeText.trim(), w
			);

			expect(text).toEqual(textSlotContent);
		});

		it('"beforeItems" slot', async () => {
			const
				w = h.dom.elNameGenerator('.b-slider', 'view-content');

			const target = await initSlider(page, {
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

			const target = await initSlider(page, {
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
