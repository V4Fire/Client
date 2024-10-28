// @ts-check

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	h = include('tests/helpers').default;

const {
	initBottomSlide,
	getComponentWindowYPos,

	open,
	close,

	prev,
	next
} = include('src/base/b-bottom-slide/test/helpers');

/**
 * @param {Playwright.Page} page
 * @param {BrowserTests.TestParams} params
 */
module.exports = (page, {browser, contextOpts}) => {
	const
		initialUrl = page.url();

	let
		context,
		gesture;

	describe('b-bottom-slide events', () => {
		const
			selector = '.b-bottom-slide__view';

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

		describe('emits `open`', () => {
			it('invokes the `open` method', async () => {
				const [component] = await initBottomSlide({
					heightMode: 'full'
				});

				const
					pr = component.evaluate((ctx) => ctx.promisifyOnce('open'));

				await open(component);

				await expectAsync(pr).toBeResolved();
			});

			it('opening via a swipe', async () => {
				const [component] = await initBottomSlide({
					heightMode: 'full',
					visible: 160
				});

				const
					pr = component.evaluate((ctx) => ctx.promisifyOnce('open'));

				await gesture.evaluate((ctx) =>
					ctx.swipe(ctx.buildSteps(3, 20, globalThis.innerHeight, 0, -20)));

				await expectAsync(pr).toBeResolved();
			});
		});

		describe('`close`', () => {
			it('invokes the `close` method', async () => {
				const [component] = await initBottomSlide({
					heightMode: 'full'
				});

				const
					pr = component.evaluate((ctx) => ctx.promisifyOnce('close'));

				await open(component);
				await close(component);

				await expectAsync(pr).toBeResolved();
			});

			it('closing via a swipe', async () => {
				const [component] = await initBottomSlide({
					heightMode: 'full'
				});

				const
					pr = component.evaluate((ctx) => ctx.promisifyOnce('close'));

				await open(component);

				const
					windowY = await getComponentWindowYPos(component);

				await gesture.evaluate((ctx, windowY) =>
					ctx.swipe(ctx.buildSteps(6, 40, windowY + 20, 0, 100, {pause: 200})), windowY);

				await expectAsync(pr).toBeResolved();
			});
		});

		describe('emits transitions', () => {
			it('invokes the `open` method', async () => {
				const [component] = await initBottomSlide({
					heightMode: 'full'
				});

				const
					start = component.evaluate((ctx) => ctx.promisifyOnce('openTransitionStart')),
					end = component.evaluate((ctx) => ctx.promisifyOnce('openTransitionEnd'));

				await open(component);

				await expectAsync(Promise.all([start, end])).toBeResolved();
			});

			it('opening via a swipe', async () => {
				const [component] = await initBottomSlide({
					heightMode: 'full',
					visible: 160
				});

				const
					start = component.evaluate((ctx) => ctx.promisifyOnce('openTransitionStart')),
					end = component.evaluate((ctx) => ctx.promisifyOnce('openTransitionEnd'));

				await gesture.evaluate((ctx) =>
					ctx.swipe(ctx.buildSteps(3, 20, globalThis.innerHeight, 0, -20)));

				await expectAsync(Promise.all([start, end])).toBeResolved();
			});

			it('invokes the `close` method', async () => {
				const [component] = await initBottomSlide({
					heightMode: 'full'
				});

				const
					start = component.evaluate((ctx) => ctx.promisifyOnce('closeTransitionStart')),
					end = component.evaluate((ctx) => ctx.promisifyOnce('closeTransitionEnd'));

				await open(component);
				await close(component);

				await expectAsync(Promise.all([start, end])).toBeResolved();
			});

			it('closing via a swipe', async () => {
				const [component] = await initBottomSlide({
					heightMode: 'full'
				});

				const
					start = component.evaluate((ctx) => ctx.promisifyOnce('closeTransitionStart')),
					end = component.evaluate((ctx) => ctx.promisifyOnce('closeTransitionEnd'));

				await open(component);

				const
					windowY = await getComponentWindowYPos(component);

				await gesture.evaluate((ctx, windowY) =>
					ctx.swipe(ctx.buildSteps(6, 40, windowY + 20, 0, 100, {pause: 200})), windowY);

				await expectAsync(Promise.all([start, end])).toBeResolved();
			});

		});

		describe('`stepChange`', () => {
			it('invokes the `next` method', async () => {
				const [component] = await initBottomSlide({
					heightMode: 'full',
					steps: [20, 40]
				});

				const
					pr = component.evaluate((ctx) => ctx.promisifyOnce('stepChange'));

				await open(component);
				await next(component);

				await expectAsync(pr).toBeResolved();
			});

			it('invokes the `prev` method', async () => {
				const [component] = await initBottomSlide({
					heightMode: 'full',
					steps: [20, 40]
				});

				const
					pr = component.evaluate((ctx) => ctx.promisifyOnce('stepChange'));

				await open(component);
				await next(component);
				await prev(component);

				await expectAsync(pr).toBeResolved();
			});

			it('step-changing via a swipe', async () => {
				const [component] = await initBottomSlide({
					heightMode: 'full',
					visible: 100,
					steps: [50]
				});

				const
					pr = component.evaluate((ctx) => ctx.promisifyOnce('stepChange'));

				await gesture.evaluate((ctx) =>
					ctx.swipe(ctx.buildSteps(4, 20, globalThis.innerHeight, 0, -100, {pause: 200})));

				await h.bom.waitForIdleCallback(page);

				await expectAsync(pr).toBeResolved();
			});
		});

		it('`moveStateChange`', async () => {
			const [component] = await initBottomSlide({
				heightMode: 'full',
				visible: 200
			});

			const
				pr = component.evaluate((ctx) => ctx.promisifyOnce('moveStateChange'));

			await gesture.evaluate((ctx) =>
				ctx.swipe(ctx.buildSteps(3, 20, globalThis.innerHeight, 0, -100), false));

			await expectAsync(pr).toBeResolved();
		});
	});
};
