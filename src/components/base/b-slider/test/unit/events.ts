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

test.describe('b-slider: emits correct events', () => {
	let
		slider: JSHandle<bSlider>;

	const
		slideWidth = 300,
		slideHeight = 200;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		const children = [1, 2, 3, 4].map((i) => ({
			type: 'img',
			attrs: {
				id: `slide_${i}`,
				src: `https://fakeimg.pl/${slideWidth}x${slideHeight}`,
				width: slideWidth,
				height: slideHeight
			}
		}));

		slider = await renderSlider(page, {children});
	});

	test('should emit `change` event when a slide is swiped', async () => {
		const isEmitted = await slider.evaluate((ctx) => new Promise<boolean>((resolve) => {
			ctx.once('change', () => resolve(true));
			ctx.moveSlide(1);
		}));

		test.expect(isEmitted).toBe(true);
	});

	test('should emit `swipeStart` event when a pointer started swiping the slider', async () => {
		await testSwipeEvent('swipeStart');
	});

	test('should emit `swipeEnd` event when a pointer stopped swiping the slider', async () => {
		await testSwipeEvent('swipeEnd');
	});

	/**
	 * @param event
	 */
	async function testSwipeEvent(event: string): Promise<void> {
		const params = {slideWidth, slideHeight, event};

		const isEmitted = await slider.evaluate(evaluate, params);

		test.expect(isEmitted).toBe(true);

		function evaluate(ctx: bSlider, {slideWidth, slideHeight, event}: typeof params): Promise<boolean> {
			return new Promise<boolean>((resolve) => {
				ctx.once(event, () => resolve(true));

				const
					slidesArea = ctx.$el?.querySelector('.b-slider__window');

				slidesArea?.dispatchEvent(createEvent('touchstart', slideWidth / 2));
				slidesArea?.dispatchEvent(createEvent('touchmove', slideWidth + 100));
				slidesArea?.dispatchEvent(createEvent('touchend', slideWidth + 100));

				function createEvent(event: string, clientX: number): TouchEvent {
					return new TouchEvent(event, {
						touches: [
							new Touch({
								identifier: Math.random(),
								target: slidesArea!,
								clientX,
								clientY: slideHeight
							})
						]
					});
				}
			});
		}
	}
});
