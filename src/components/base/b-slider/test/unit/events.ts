/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';

import test from 'tests/config/unit/test';
import Gestures from 'tests/helpers/gestures';

import type GesturesInterface from 'core/prelude/test-env/gestures';

import type bSlider from 'components/base/b-slider/b-slider';

import { renderSlider } from 'components/base/b-slider/test/helpers';

test.describe('b-slider: emits correct events', () => {
	let
		slider: JSHandle<bSlider>,
		gestures: JSHandle<GesturesInterface>;

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

		const
			selector = '.b-slider__window';

		gestures = await Gestures.create(page, {
			targetEl: selector,
			dispatchEl: selector
		});
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
		const isEmitted = await slider.evaluate((ctx, {gestures, event}) => new Promise((resolve) => {
			ctx.on(event, () => resolve(true));

			void gestures.swipe(gestures.buildSteps(2, 150, 50, 150, 0), true);
		}), {gestures, event});

		test.expect(isEmitted).toBe(true);
	}
});
