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

import { renderSlider, current } from 'components/base/b-slider/test/helpers';

test.use({
	isMobile: true,
	hasTouch: true,
	viewport: {
		width: 375,
		height: 667
	}
});

test.describe('<b-slider> auto slide', () => {
	const
		autoSlideInterval = (1).second();

	let
		slider: JSHandle<bSlider>,
		gestures: JSHandle<GesturesInterface>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		slider = await renderSlider(page, {childrenIds: [1, 2, 3, 4], attrs: {autoSlideInterval, id: 'slider'}});

		gestures = await Gestures.create(page);

	});

	test('should automatically move to the next slide when `autoSlideInterval` is positive', async () => {
		test.expect(await current(slider)).toBe(0);

		const timeStart = new Date().getTime();
		await test.expect.poll(async () => current(slider)).toBe(1);
		const timeEnd = new Date().getTime();

		const timeDiff = timeEnd - timeStart;

		test.expect(timeDiff).toBeGreaterThan(autoSlideInterval);
		test.expect(timeDiff).toBeLessThanOrEqual(2 * autoSlideInterval);
	});

	test('automatic moves should be paused on touch start', async () => {
		test.expect(await current(slider)).toBe(0);
		const timeStart = new Date().getTime();

		await gestures.evaluate((ctx) => {
			ctx.dispatchTouchEvent('touchstart', {x: 0, y: 0});
			ctx.dispatchTouchEvent('touchmove', [{x: 0, y: 0}, {x: 0, y: 0}]);
		});

		await test.expect.poll(() => new Date().getTime() - timeStart)
			.toBeGreaterThan(2 * autoSlideInterval);

		test.expect(await current(slider)).toBe(0);
	});

	test('automatic moves should be resumed on touch end', async () => {
		test.expect(await current(slider)).toBe(0);

		await gestures.evaluate((ctx) => {
			ctx.dispatchTouchEvent('touchstart', {x: 0, y: 0});
			ctx.dispatchTouchEvent('touchmove', [{x: 0, y: 0}, {x: 0, y: 0}]);
			ctx.dispatchTouchEvent('touchend', {x: 0, y: 0});
		});

		const timeStart = new Date().getTime();
		await test.expect.poll(() => new Date().getTime() - timeStart)
			.toBeGreaterThan(autoSlideInterval);

		test.expect(await current(slider)).toBe(1);
	});
});
