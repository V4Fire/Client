/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

const
	h = include('tests/helpers');

const {
	open,
	close,
	prev,
	next,
	init,
	getComponentWindowYPos
} = include('src/base/b-bottom-slide/test/helpers');

/**
 * Starts a test
 *
 * @param {Playwright.Page} page
 * @param {object} params
 * @returns {void}
 */
module.exports = (page, {browser, contextOpts}) => {
	const initialUrl = page.url();

	let
		context,
		gesture;

	describe('`base/b-bottom-slide events`', () => {
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
			it('`open` method has been called', async () => {
				const [component] = await init({
					heightMode: 'full'
				});

				const
					pr = component.evaluate((ctx) => ctx.promisifyOnce('open'));

				await open(component);

				await expectAsync(pr).toBeResolved();
			});

			it('opened via swipe', async () => {
				const [component] = await init({
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
			it('`close` method has been called', async () => {
				const [component] = await init({
					heightMode: 'full'
				});

				const
					pr = component.evaluate((ctx) => ctx.promisifyOnce('close'));

				await open(component);
				await close(component);

				await expectAsync(pr).toBeResolved();
			});

			it('closed via swipe', async () => {
				const [component] = await init({
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

		describe('`stepChange`', () => {
			it('`next` method has been called', async () => {
				const [component] = await init({
					heightMode: 'full',
					steps: [20, 40]
				});

				const
					pr = component.evaluate((ctx) => ctx.promisifyOnce('stepChange'));

				await open(component);
				await next(component);

				await expectAsync(pr).toBeResolved();
			});

			it('`prev` method has been called', async () => {
				const [component] = await init({
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

			it('step changed via swipe', async () => {
				const [component] = await init({
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
			const [component] = await init({
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
