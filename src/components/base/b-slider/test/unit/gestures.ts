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
import { renderSlider, current, lastIndex } from 'components/base/b-slider/test/helpers';

test.use({
	isMobile: true,
	hasTouch: true,
	viewport: {
		width: 375,
		height: 667
	}
});

test.describe('<b-slider> gestures', () => {
	let
		slider: JSHandle<bSlider>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		slider = await renderSlider(page, {childrenIds: [1, 2, 3, 4]});
	});

	test('swipes right on the first slide: should swipe to the second slide', async () => {
		test.expect(await current(slider)).toBe(0);

		const curr = await slider.evaluate((ctx) => {
			ctx.moveSlide(1);

			return ctx.current;
		});

		test.expect(curr).toBe(1);
	});

	test.describe('swipes left on the first slide', () => {
		test('with the `circular` prop set to `true`: should swipe to the last slide', async ({page}) => {
			const slider = await renderSlider(page, {
				attrs: {
					circular: true
				}
			});

			test.expect(await current(slider)).toBe(0);

			const {curr, lastIdx} = await slider.evaluate((ctx) => {
				ctx.moveSlide(-1);

				return {
					curr: ctx.current,
					lastIdx: ctx.contentLength - 1
				};
			});

			test.expect(curr).toBe(lastIdx);
		});

		test('with the `circular` prop set to `false` by default: should stay on the first slide', async () => {
			test.expect(await current(slider)).toBe(0);

			const curr = await slider.evaluate((ctx) => {
				ctx.moveSlide(-1);

				return ctx.current;
			});

			test.expect(curr).toBe(0);
		});

	});

	test.describe('swipes right on the last slide', () => {
		test('with the `circular` prop set to `true`: should swipe to the first slide', async ({page}) => {
			const slider = await renderSlider(page, {
				attrs: {
					circular: true
				}
			});

			let
				curr: number;

			const
				lastIdx = await lastIndex(slider);

			curr = await slider.evaluate(async (ctx, lastIdx) => {
				await ctx.slideTo(lastIdx);

				return ctx.current;
			}, lastIdx);

			test.expect(curr).toBe(lastIdx);

			curr = await slider.evaluate((ctx) => {
				ctx.moveSlide(1);

				return ctx.current;
			});

			test.expect(curr).toBe(0);
		});

		test('with the `circular` prop set to `false` by default: should stay on the last slide', async () => {
			let
				curr: number;

			const
				lastIdx = await lastIndex(slider);

			curr = await slider.evaluate(async (ctx, lastIdx) => {
				await ctx.slideTo(lastIdx);

				return ctx.current;
			}, lastIdx);

			test.expect(curr).toBe(lastIdx);

			curr = await slider.evaluate((ctx) => {
				ctx.moveSlide(1);

				return ctx.current;
			});

			test.expect(curr).toBe(lastIdx);
		});
	});
});
