/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import { renderSlider, current } from 'components/base/b-slider/test/helpers';

const VIEWPORT_WIDTH = 375;

test.use({
	isMobile: true,
	hasTouch: true,
	viewport: {
		width: VIEWPORT_WIDTH,
		height: 667
	}
});

test.describe('<b-slider> in scroll snap mode', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test.describe('g-slider rendering', () => {
		test('should render g-slider', async ({page}) => {
			await renderSlider(page, {
				childrenIds: [1, 2, 3, 4],
				attrs: {
					useScrollSnap: true,
					mode: 'scroll'
				}
			});

			await test.expect(page.locator('.b-slider .g-slider')).toBeVisible();
		});

		test('should not render g-slider if the mode is `slide`', async ({page}) => {
			await renderSlider(page, {
				attrs: {
					id: 'swipe_slider'
				}
			});

			await test.expect(page.locator('#swipe_slider .g-slider')).toBeHidden();
		});

		test('should not render g-slider if the mode is `scroll` and useSnapScroll is `false`', async ({page}) => {
			await renderSlider(page, {
				attrs: {
					id: 'scroll_slider',
					mode: 'scroll'
				}
			});

			await test.expect(page.locator('#scroll_slider .g-slider')).toBeHidden();
		});

	});

	test('should throw error with `useScrollSnap = true` and `mode = slide`', async ({page}) => {
		await test.expect(renderSlider(page, {
			childrenIds: [1, 2, 3],
			attrs: {
				useScrollSnap: true,
				mode: 'slide'
			}
		})).rejects.toThrowError();
	});

	test("shouldn't automatically scroll when `autoSliderInterval` prop is set", async ({page}) => {
		const scrollSnapSlider = await renderSlider(page, {
			attrs: {
				useScrollSnap: true,
				mode: 'scroll',
				autoSlideInterval: 10
			}
		});

		await test.expect(current(scrollSnapSlider)).toBeResolvedTo(0);

		await scrollSnapSlider.evaluate((ctx) => ctx.unsafe.async.sleep(20));

		await test.expect(current(scrollSnapSlider)).toBeResolvedTo(0);
	});

	test.describe('swipe', () => {
		test('should align slides to the edge of the container', async ({page}) => {
			const children = [1, 2, 3, 4].map((i) => ({
				type: 'img',
				attrs: {
					id: `slide_${i}`,
					src: `https://fakeimg.pl/${VIEWPORT_WIDTH}x300`,
					width: VIEWPORT_WIDTH,
					height: 300
				}
			}));

			await renderSlider(page, {
				children: {
					default: children
				},

				attrs: {
					useScrollSnap: true,
					mode: 'scroll'
				}
			});

			await page.mouse.wheel(250, 0);

			const position = await page.evaluate(() => Number(document.querySelector('.g-slider')?.scrollLeft));

			test.expect(position % VIEWPORT_WIDTH).toBe(0);
		});
	});
});
