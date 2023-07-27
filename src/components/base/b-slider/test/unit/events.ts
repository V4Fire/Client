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
import Component from 'tests/helpers/component';
import DOM from 'tests/helpers/dom';

import type GesturesInterface from 'core/prelude/test-env/gestures';

import type bSlider from 'components/base/b-slider/b-slider';

test.describe('<b-slider> standard component events', () => {
	let
		slider: JSHandle<bSlider>,
		gestures: JSHandle<GesturesInterface>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		const children = [1, 2, 3, 4].map((i) => ({
			type: 'img',
			attrs: {
				id: `slide_${i}`,
				src: 'https://fakeimg.pl/$300x$200',
				width: 300,
				height: 200
			}
		}));

		slider = await Component.createComponent<bSlider>(page, 'b-slider', {children});

		const
			selector = DOM.elNameSelectorGenerator('b-slider', 'window');

		gestures = await Gestures.create(page, {
			targetEl: selector,
			dispatchEl: selector
		});
	});

	test('should emit a `change` event when a slide is swiped', async () => {
		const isEmitted = await slider.evaluate((ctx) => new Promise<boolean>((resolve) => {
			ctx.once('change', () => resolve(true));
			ctx.moveSlide(1);
		}));

		test.expect(isEmitted).toBe(true);
	});

	test('should emit a `swipeStart` event when the pointer started swiping the slider', async () => {
		await testSwipeEvent('swipeStart');
	});

	test('should emit a `swipeEnd` event when the pointer stopped swiping the slider', async () => {
		await testSwipeEvent('swipeEnd');
	});

	async function testSwipeEvent(event: string): Promise<void> {
		const isEmitted = await slider.evaluate((ctx, {gestures, event}) => new Promise((resolve) => {
			ctx.on(event, () => resolve(true));

			void gestures.swipe(gestures.buildSteps(2, 150, 50, 150, 0), true);
		}), {gestures, event});

		test.expect(isEmitted).toBe(true);
	}
});
