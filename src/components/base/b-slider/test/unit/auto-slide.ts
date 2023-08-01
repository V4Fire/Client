/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type {JSHandle} from 'playwright';

import test from 'tests/config/unit/test';
import Gestures from 'tests/helpers/gestures';

import type GesturesInterface from 'core/prelude/test-env/gestures';

import type bSlider from 'components/base/b-slider/b-slider';

import {renderSlider, current} from 'components/base/b-slider/test/helpers';

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
		pollOptions = {
			intervals: [200]
		};

	let
		slider: JSHandle<bSlider>,
		gestures: JSHandle<GesturesInterface>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		gestures = await Gestures.create(page);

	});

	test.describe('enabled', () => {
		const
			autoSlideInterval = (1).second(),
			autoSlidePostGestureDelay = (2).seconds();

		test.describe('slides are static', () => {
			test.beforeEach(async ({page}) => {
				slider = await renderSlider(page, {
					childrenIds: [1, 2, 3, 4],
					attrs: {
						autoSlideInterval,
						autoSlidePostGestureDelay
					}
				});
			});

			test('should automatically move to the next slide when `autoSlideInterval` is positive', async () => {
				test.expect(await current(slider)).toBe(0);

				const timeStart = new Date().getTime();
				await test.expect.poll(async () => current(slider), pollOptions).toBe(1);
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

				await test.expect.poll(() => new Date().getTime() - timeStart, pollOptions)
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
				await test.expect.poll(() => new Date().getTime() - timeStart, pollOptions)
					.toBeGreaterThan(autoSlidePostGestureDelay);

				test.expect(await current(slider)).toBe(1);
			});

		});

		test.describe('slides are loaded via provider', () => {
			const
				providerDelay = (3).seconds(),
				providerItems = [{id: 'first'}, {id: 'second'}, {id: 'third'}, {id: 'forth'}, {id: 'fifth'}];

			let
				timeStart: number;

			test.beforeEach(async ({context, page}) => {
				await context.route('/api', async (route) => {
					await new Promise((resolve) => setTimeout(resolve, providerDelay));
					await route.fulfill({
						status: 200,
						body: JSON.stringify(providerItems)
					});
				});

				timeStart = new Date().getTime();

				slider = await renderSlider(page, {
					attrs: {
						autoSlideInterval,
						dataProvider: 'Provider',
						item: 'b-checkbox',
						itemProps: ({id}) => ({id}),
						componentConverter: (val) => JSON.parse(val)
					}
				});
			});

			test('automatic moves should not be started before slides are loaded', async () => {
				test.expect(await current(slider)).toBe(0);

				await test.expect.poll(() => new Date().getTime() - timeStart, pollOptions)
					.toBeGreaterThan(providerDelay + autoSlideInterval);

				test.expect(await current(slider)).toBe(1);

			});

		});

	});

	test.describe('disabled', () => {

		test('should not auto slide if `autoSlideInterval` is not set', async ({page}) => {
			slider = await renderSlider(page, {});

			await expectDoesNotAutoSlide();
		});

		test('should not auto slide if `autoSlideInterval` is set to `0`', async ({page}) => {
			slider = await renderSlider(page, {
				attrs: {
					autoSlideInterval: 0
				}
			});

			await expectDoesNotAutoSlide();
		});

		test('should not auto slide if `mode` is not `slide`', async ({page}) => {
			slider = await renderSlider(page, {
				attrs: {
					mode: 'scroll'
				}
			});

			await expectDoesNotAutoSlide();
		});

		async function expectDoesNotAutoSlide(timeout: number = (5).seconds()): Promise<void> {
			test.expect(await current(slider)).toBe(0);

			const timeStart = new Date().getTime();

			await test.expect
				.poll(() => new Date().getTime() - timeStart, {
					...pollOptions,
					timeout: 2 * timeout
				})
				.toBeGreaterThan(timeout);

			test.expect(await current(slider)).toBe(0);
		}
	});

});
