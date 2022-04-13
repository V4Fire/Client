// @ts-check

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const {
	initBottomSlide,

	getAbsoluteComponentWindowOffset,
	getComponentWindowYPos,
	getAbsolutePageHeight,

	open
} = include('src/base/b-bottom-slide/test/helpers');

const
	h = include('tests/helpers').default;

/**
 * @param {Playwright.Page} page
 * @param {BrowserTests.TestParams} params
 */
module.exports = (page, {browser, contextOpts}) => {
	const initialUrl = page.url();

	const
		INITIAL_MAX_VISIBLE_PERCENT = 90;

	let
		context,
		gesture;

	describe('b-bottom-slide gestures', () => {
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

			await page.addStyleTag({
				content: '#test-div {height: 3000px;}'
			});
		});

		afterEach(() => context.close());

		it('opens via a fast swipe', async () => {
			const [component] = await initBottomSlide({
				heightMode: 'full',
				visible: 200
			});

			await gesture.evaluate((ctx) =>
				ctx.swipe(ctx.buildSteps(3, 20, globalThis.innerHeight, 0, -20)));

			const
				windowTopOffset = await getAbsoluteComponentWindowOffset(component),
				maxWindowHeight = await getAbsolutePageHeight(INITIAL_MAX_VISIBLE_PERCENT),
				openedModVal = await component.evaluate(({mods}) => mods.opened);

			expect(windowTopOffset).toBe(maxWindowHeight);
			expect(openedModVal).toBe('true');
		});

		it('opens via a slow pull-up', async () => {
			const [component] = await initBottomSlide({
				heightMode: 'full',
				visible: 200
			});

			await gesture.evaluate((ctx) =>
				ctx.swipe(ctx.buildSteps(6, 20, globalThis.innerHeight, 0, -100, {pause: 200})));

			const
				windowTopOffset = await getAbsoluteComponentWindowOffset(component),
				maxWindowHeight = await getAbsolutePageHeight(INITIAL_MAX_VISIBLE_PERCENT),
				openedModVal = await component.evaluate(({mods}) => mods.opened);

			expect(windowTopOffset).toBe(maxWindowHeight);
			expect(openedModVal).toBe('true');
		});

		it('pulls up the window with cursor moves up', async () => {
			const [component] = await initBottomSlide({
				heightMode: 'full',
				visible: 200
			});

			await gesture.evaluate((ctx) =>
				ctx.swipe(ctx.buildSteps(3, 20, globalThis.innerHeight, 0, -100), false));

			await h.bom.waitForIdleCallback(page);

			const
				windowTopOffset = await getAbsoluteComponentWindowOffset(component);

			expect(windowTopOffset).toBe(400);
		});

		it('closes via a fast swipe', async () => {
			const [component] = await initBottomSlide({
				heightMode: 'full'
			});

			await open(component);

			const
				windowY = await getComponentWindowYPos(component);

			await gesture.evaluate((ctx, windowY) =>
				ctx.swipe(ctx.buildSteps(5, 40, windowY + 20, 0, 30)), windowY);

			const
				currentWindowTopOffset = await getAbsoluteComponentWindowOffset(component),
				openedModVal = await component.evaluate(({mods}) => mods.opened);

			expect(currentWindowTopOffset).toBe(0);
			expect(openedModVal).toBe('false');
		});

		it('closes via a slow pull-down', async () => {
			const [component] = await initBottomSlide({
				heightMode: 'full'
			});

			await open(component);

			const
				windowY = await getComponentWindowYPos(component);

			await gesture.evaluate((ctx, windowY) =>
				ctx.swipe(ctx.buildSteps(6, 40, windowY + 20, 0, 100, {pause: 200})), windowY);

			const
				currentWindowTopOffset = await getAbsoluteComponentWindowOffset(component),
				openedModVal = await component.evaluate(({mods}) => mods.opened);

			expect(currentWindowTopOffset).toBe(0);
			expect(openedModVal).toBe('false');
		});

		it('pulls down the window with cursor moves down', async () => {
			const [component] = await initBottomSlide({
				heightMode: 'full'
			});

			await open(component);

			const
				windowY = await getComponentWindowYPos(component);

			await gesture.evaluate((ctx, windowY) =>
				ctx.swipe(ctx.buildSteps(3, 40, windowY + 20, 0, 100, {pause: 200}), false), windowY);

			await h.bom.waitForIdleCallback(page);

			const
				windowTopOffset = await getAbsoluteComponentWindowOffset(component);

			expect(windowTopOffset).toBe(400);
		});

		it('sticks to the closest step on a slow pull-up', async () => {
			const [component] = await initBottomSlide({
				heightMode: 'full',
				visible: 100,
				steps: [50]
			});

			await gesture.evaluate((ctx) =>
				ctx.swipe(ctx.buildSteps(4, 20, globalThis.innerHeight, 0, -100, {pause: 200})));

			await h.bom.waitForIdleCallback(page);

			const
				windowY = await getComponentWindowYPos(component),
				halfPageHeight = await page.evaluate(() => Math.round(innerHeight / 2));

			expect(windowY).toBe(halfPageHeight);
		});

		it('sticks to the closest step on a fast pull-up', async () => {
			const [component] = await initBottomSlide({
				heightMode: 'full',
				visible: 100,
				steps: [50]
			});

			await gesture.evaluate((ctx) =>
				ctx.swipe(ctx.buildSteps(3, 20, globalThis.innerHeight, 0, -20)));

			await h.bom.waitForIdleCallback(page);

			const
				windowY = await getComponentWindowYPos(component),
				halfPageHeight = await page.evaluate(() => Math.round(innerHeight / 2));

			expect(windowY).toBe(halfPageHeight);
		});

		it('skips all the steps on a full pull-up', async () => {
			const [component] = await initBottomSlide({
				heightMode: 'full',
				visible: 100,
				steps: [30, 50, 60]
			});

			await gesture.evaluate((ctx) =>
				ctx.swipe(ctx.buildSteps(7, 20, globalThis.innerHeight, 0, -100, {pause: 200})));

			await h.bom.waitForIdleCallback(page);

			const
				windowTopOffset = await getAbsoluteComponentWindowOffset(component),
				maxWindowHeight = await getAbsolutePageHeight(INITIAL_MAX_VISIBLE_PERCENT);

			expect(windowTopOffset).toBe(maxWindowHeight);
		});

		it('does not skips any steps before a full pull-up', async () => {
			const
				steps = [30, 60];

			const [component] = await initBottomSlide({
				heightMode: 'full',
				visible: 100,
				steps
			});

			const [window30PercentOfHeight, window60PercentOfHeight] = await page.evaluate(() => [
				Math.round(globalThis.innerHeight * 0.3),
				Math.round(globalThis.innerHeight * 0.6)
			]);

			await gesture.evaluate((ctx) =>
				ctx.swipe(ctx.buildSteps(2, 20, globalThis.innerHeight, 0, -100, {pause: 200})));

			let
				windowTopOffset = await getAbsoluteComponentWindowOffset(component);

			expect(windowTopOffset).toBe(window30PercentOfHeight);

			await gesture.evaluate((ctx) =>
				ctx.swipe(ctx.buildSteps(2, 20, globalThis.innerHeight - 200, 0, -100, {pause: 200})));

			windowTopOffset = await getAbsoluteComponentWindowOffset(component);

			expect(windowTopOffset).toBe(window60PercentOfHeight);
		});

		it('cannot be pulled more than the maximum height', async () => {
			const
				contentHeight = 300;

			await page.addStyleTag({content: `
				.b-bottom-slide__view {background-color: green;}
				#test-div {height: ${contentHeight}px !important;}
			`});

			const [component] = await initBottomSlide({
				heightMode: 'content',
				visible: 80
			});

			await gesture.evaluate((ctx) =>
				ctx.swipe(ctx.buildSteps(5, 20, globalThis.innerHeight - 80, 0, -100, {pause: 200}), false));

			const
				windowTopOffset = await getAbsoluteComponentWindowOffset(component);

			expect(windowTopOffset).toBe(contentHeight);
		});
	});
};
