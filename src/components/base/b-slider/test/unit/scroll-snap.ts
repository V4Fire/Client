/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import Gestures from 'tests/helpers/gestures';

import { current, renderSlider } from 'components/base/b-slider/test/helpers';

test.use({
	isMobile: true,
	hasTouch: true,
	viewport: {
		width: 375,
		height: 667
	}
});

test.describe.only('<b-slider> in scroll snap mode', () => {

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

		test('should not render g-slider if mode is `swipe`', async ({page}) => {
			await renderSlider(page, {
				attrs: {
					id: 'swipe_slider'
				}
			});

			await test.expect(page.locator('#swipe_slider .g-slider')).not.toBeVisible();
		});

		test('should not render g-slider if mode is `scroll` and useSnapScroll is `false`', async ({page}) => {
			await renderSlider(page, {
				attrs: {
					mode: 'scroll'
				}
			});

			await test.expect(page.locator('#scroll_slider .g-slider')).not.toBeVisible();
		});

	});

	test('should throw error `useScrollSnap = true` and `mode = slide`', async ({page}) => {
		await test.expect(renderSlider(page, {
			childrenIds: [1, 2, 3],
			attrs: {
				useScrollSnap: true,
				mode: 'slide'
			}
		})).rejects.toThrowError();
	});

	test('shouldn\'t automatically scroll', async ({page}) => {
		const scrollSnapSlider = await renderSlider(page, {
			attrs: {
				useScrollSnap: true,
				mode: 'scroll'
			}
		});

		test.expect(await current(scrollSnapSlider)).toBe(0);

		await scrollSnapSlider.evaluate((ctx) => ctx.unsafe.async.sleep(200));

		test.expect(await current(scrollSnapSlider)).toBe(0);
	});

	test('should not be handled by touch events', async ({page}) => {
		const scrollSnapSlider = await renderSlider(page, {
			attrs: {
				useScrollSnap: true,
				mode: 'scroll'
			}
		});

		test.expect(await current(scrollSnapSlider)).toBe(0);

		await Gestures.dispatchTouchEvent(page, 'touchstart', {x: 0, y: 0});
		await Gestures.dispatchTouchEvent(page, 'touchend', {x: 0, y: 0});

		await scrollSnapSlider.evaluate((ctx) => ctx.unsafe.async.sleep(200));

		test.expect(await current(scrollSnapSlider)).toBe(0);
	});

});
