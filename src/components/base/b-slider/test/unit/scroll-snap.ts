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
import { renderSlider } from 'components/base/b-slider/test/helpers';

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
		scrollSnapSlider: JSHandle<bSlider>;

	test.beforeEach(async ({page, demoPage}) => {
		await demoPage.goto();

		scrollSnapSlider = await renderSlider(page, {
			childrenIds: [1, 2, 3, 4],
			children: [
				{type: 'img', attrs: {id: 'slide_1', src: 'https://fakeimg.pl/375x300'}},
				{type: 'img', attrs: {id: 'slide_2', src: 'https://fakeimg.pl/375x300'}},
				{type: 'img', attrs: {id: 'slide_3', src: 'https://fakeimg.pl/375x300'}},
				{type: 'img', attrs: {id: 'slide_4', src: 'https://fakeimg.pl/375x300'}}
			],
			attrs: {
				useScrollSnap: true,
				mode: 'scroll'
			}
		});
	});

	test('should render g-slider', async ({page}) => {
		await test.expect(page.locator('div:nth-child(2) > .b-slider__window > .g-slider')).toBeVisible();
	});

	test('should throw error if slider in `slide` mode uses the CSS Scroll Snap (useScrollSnap = true)', async ({page}) => {
		await test.expect(renderSlider(page, {
			childrenIds: [1, 2, 3],
			attrs: {
				useScrollSnap: true,
				mode: 'slide'
			}
		})).rejects.toThrowError();
	});

});
