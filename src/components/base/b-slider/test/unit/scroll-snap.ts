/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';

import test from 'tests/config/unit/test';

import type bSlider from 'components/base/b-slider/b-slider';
import { current, renderSlider } from 'components/base/b-slider/test/helpers';

test.use({
	isMobile: true,
	hasTouch: true,
	viewport: {
		width: 375,
		height: 667
	}
});

test.describe('<b-slider> in scroll snap mode', () => {
	let
		scrollSnapSlider: JSHandle<bSlider>,
		scrollSlider: JSHandle<bSlider>,
		swipeSlider: JSHandle<bSlider>;

	test.beforeEach(async ({page, demoPage}) => {
		await demoPage.goto();

		const children = [
			{type: 'img', attrs: {id: 'slide_1', src: 'https://fakeimg.pl/375x300'}},
			{type: 'img', attrs: {id: 'slide_2', src: 'https://fakeimg.pl/375x300'}},
			{type: 'img', attrs: {id: 'slide_3', src: 'https://fakeimg.pl/375x300'}},
			{type: 'img', attrs: {id: 'slide_4', src: 'https://fakeimg.pl/375x300'}}
		];

		scrollSnapSlider = await renderSlider(page, {
			childrenIds: [1, 2, 3, 4],
			children,
			attrs: {
				useScrollSnap: true,
				mode: 'scroll'
			}
		});

		swipeSlider = await renderSlider(page, {
			childrenIds: [1, 2, 3, 4],
			children,
			attrs: {
				id: 'swipe_slider'
			}
		});

		scrollSlider = await renderSlider(page, {
			childrenIds: [1, 2, 3, 4],
			children,
			attrs: {
				id: 'scroll_slider',
				mode: 'scroll'
			}
		});
	});

	test.describe('g-slider rendering', () => {
		test('should render g-slider', async ({page}) => {
			await test.expect(page.locator('.b-slider .g-slider')).toBeVisible();
		});

		test('should not render g-slider if mode is `swipe`', async ({page}) => {
			await test.expect(page.locator('#swipe_slider .g-slider')).not.toBeVisible();
		});

		test('should not render g-slider if mode is `scroll` and useSnapScroll is `false`', async ({page}) => {
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

	test('shouldn\'t automatically scroll', async () => {
		test.expect(await current(scrollSnapSlider)).toBe(0);

		const timeStart = new Date().getTime();

		await test.expect
			.poll(() => new Date().getTime() - timeStart, {
				timeout: 200
			})
			.toBeGreaterThan(100);

		test.expect(await current(scrollSnapSlider)).toBe(0);
	});

});
