// @ts-check

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const {
	initDefaultSlider,
	current,
	lastIndex,
	toLastSlide,
	currentOffset
} = include('src/base/b-slider/test/helpers');

const
	h = include('tests/helpers');

/**
 * @param {Playwright.Page} page
 * @param {BrowserTests.TestParams} params
 */
module.exports = (page, {browser, contextOpts}) => {
	const initialUrl = page.url();

	let
		context,
		gesture;

	const slidesOffset = [0, 262.5, 562.5, 862.5];

	describe('b-slider gestures', () => {
		const
			selector = '.b-slider__window';

		beforeEach(async () => {
			context = await browser.newContext({
				...contextOpts,
				isMobile: true,
				viewport: {
					width: 375,
					height: 667
				}
			});

			page = await context.newPage();
			await page.goto(initialUrl);

			globalThis._testEnv = {
				...globalThis._testEnv,
				page
			};

			gesture = await h.gestures.create(page, {
				dispatchEl: selector,
				targetEl: selector
			});
		});

		afterEach(() => context.close());

		it('swipe left on the first slide', async () => {
			const component = await initDefaultSlider(page);

			await gesture.evaluate((ctx) =>
				ctx.swipe(ctx.buildSteps(2, 150, 50, 150, 0)));

			expect(await current(component)).toBe(0);
			expect(await currentOffset(component)).toBe(slidesOffset[0]);
		});

		it('swipe right on the first slide', async () => {
			const component = await initDefaultSlider(page);

			await gesture.evaluate((ctx) =>
				ctx.swipe(ctx.buildSteps(2, 150, 50, -150, 0)));

			expect(await current(component)).toBe(1);
			expect(await currentOffset(component)).toBe(slidesOffset[1]);
		});

		it('double swipe right on the first slide', async () => {
			const component = await initDefaultSlider(page);

			await gesture.evaluate((ctx) =>
				ctx.swipe(ctx.buildSteps(2, 150, 50, -150, 0)));

			await gesture.evaluate((ctx) =>
				ctx.swipe(ctx.buildSteps(2, 150, 50, -150, 0)));

			expect(await current(component)).toBe(2);
			expect(await currentOffset(component)).toBe(slidesOffset[2]);
		});

		it('swipe right on the last slide', async () => {
			const component = await initDefaultSlider(page);

			await toLastSlide(component);

			await gesture.evaluate((ctx) =>
				ctx.swipe(ctx.buildSteps(2, 150, 50, -150, 0)));

			expect(await current(component)).toBe(await lastIndex(component));
			expect(await currentOffset(component)).toBe(slidesOffset[3]);
		});

		it('swipe left on the last slide', async () => {
			const component = await initDefaultSlider(page);

			await toLastSlide(component);

			await gesture.evaluate((ctx) =>
				ctx.swipe(ctx.buildSteps(2, 150, 50, 150, 0)));

			expect(await current(component)).toBe(await lastIndex(component) - 1);
			expect(await currentOffset(component)).toBe(slidesOffset[2]);
		});

		it('swipe right on the first slide and than swipe back', async () => {
			const component = await initDefaultSlider(page);

			await gesture.evaluate((ctx) =>
				ctx.swipe(ctx.buildSteps(2, 150, 50, -150, 0)));

			expect(await current(component)).toBe(1);
			expect(await currentOffset(component)).toBe(slidesOffset[1]);

			await gesture.evaluate((ctx) =>
				ctx.swipe(ctx.buildSteps(2, 150, 50, 150, 0)));

			expect(await current(component)).toBe(0);
			expect(await currentOffset(component)).toBe(slidesOffset[0]);
		});

		it('short swipe - swipeToleranceX not passed', async () => {
			const component = await initDefaultSlider(page);

			await gesture.evaluate((ctx) =>
				ctx.swipe(ctx.buildSteps(2, 150, 50, -30, 0, {pause: 300})));

			expect(await current(component)).toBe(0);
			expect(await currentOffset(component)).toBe(slidesOffset[0]);
		});

		it('fast short swipe', async () => {
			const component = await initDefaultSlider(page);

			await gesture.evaluate((ctx) =>
				ctx.swipe(ctx.buildSteps(2, 150, 50, -30, 0)));

			expect(await current(component)).toBe(1);
			expect(await currentOffset(component)).toBe(slidesOffset[1]);
		});
	});
};
