/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */
import type { BrowserContext, JSHandle } from 'playwright';

import type GesturesInterface from 'core/prelude/test-env/gestures';
import Gestures from 'tests/helpers/gestures';
import test from 'tests/config/unit/test';

import {

	renderBottomSlide,

	getAbsoluteComponentWindowOffset,
	getComponentWindowYPos,
	getAbsolutePageHeight,

	open

} from 'components/base/b-bottom-slide/test/new-helpers';
import BOM from 'tests/helpers/bom';

const INITIAL_MAX_VISIBLE_PERCENT = 90;

test.use({
	isMobile: true,
	viewport: {
		width: 375,
		height: 667
	}
});

test.describe('<b-bottom-slide> gestures', () => {
	const
		selector = '.b-bottom-slide__view';

	let
		context: BrowserContext,
		gesture: JSHandle<GesturesInterface>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		gesture = await Gestures.create(page, {
			dispatchEl: selector,
			targetEl: selector
		});

		await page.addStyleTag({
			content: '#test-div {height: 3000px;}'
		});
	});

	test.afterEach(() => context.close());

	test('opens via a fast swipe', async ({page}) => {
		const component = await renderBottomSlide(page, {
			heightMode: 'full',
			visible: 200
		});

		await gesture.evaluate((ctx) =>
			ctx.swipe(ctx.buildSteps(3, 20, globalThis.innerHeight, 0, -20)));

		const
			windowTopOffset = await getAbsoluteComponentWindowOffset(component),
			maxWindowHeight = await getAbsolutePageHeight(page, INITIAL_MAX_VISIBLE_PERCENT),
			openedModVal = await component.evaluate(({mods}) => mods.opened);

		expect(windowTopOffset).toBe(maxWindowHeight);
		expect(openedModVal).toBe('true');
	});

	test('opens via a slow pull-up', async ({page}) => {
		const component = await renderBottomSlide(page, {
			heightMode: 'full',
			visible: 200
		});

		await gesture.evaluate((ctx) =>
			ctx.swipe(ctx.buildSteps(6, 20, globalThis.innerHeight, 0, -100, {pause: 200})));

		const
			windowTopOffset = await getAbsoluteComponentWindowOffset(component),
			maxWindowHeight = await getAbsolutePageHeight(page, INITIAL_MAX_VISIBLE_PERCENT),
			openedModVal = await component.evaluate(({mods}) => mods.opened);

		expect(windowTopOffset).toBe(maxWindowHeight);
		expect(openedModVal).toBe('true');
	});

	test('pulls up the window with cursor moves up', async ({page}) => {
		const component = await renderBottomSlide(page, {
			heightMode: 'full',
			visible: 200
		});

		await gesture.evaluate((ctx) =>
			ctx.swipe(ctx.buildSteps(3, 20, globalThis.innerHeight, 0, -100), false));

		await BOM.waitForIdleCallback(page);

		const
			windowTopOffset = await getAbsoluteComponentWindowOffset(component);

		expect(windowTopOffset).toBe(400);
	});

	test('closes via a fast swipe', async ({page}) => {
		const component = await renderBottomSlide(page, {
			heightMode: 'full'
		});

		await open(page, component);

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

	test('closes via a slow pull-down', async ({page}) => {
		const component = await renderBottomSlide(page, {
			heightMode: 'full'
		});

		await open(page, component);

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

	test('pulls down the window with cursor moves down', async ({page}) => {
		const component = await renderBottomSlide(page, {
			heightMode: 'full'
		});

		await open(page, component);

		const
			windowY = await getComponentWindowYPos(component);

		await gesture.evaluate((ctx, windowY) =>
			ctx.swipe(ctx.buildSteps(3, 40, windowY + 20, 0, 100, {pause: 200}), false), windowY);

		await BOM.waitForIdleCallback(page);

		const
			windowTopOffset = await getAbsoluteComponentWindowOffset(component);

		expect(windowTopOffset).toBe(400);
	});

	test('sticks to the closest step on a slow pull-up', async ({page}) => {
		const component = await renderBottomSlide(page, {
			heightMode: 'full',
			visible: 100,
			steps: [50]
		});

		await gesture.evaluate((ctx) =>
			ctx.swipe(ctx.buildSteps(4, 20, globalThis.innerHeight, 0, -100, {pause: 200})));

		await BOM.waitForIdleCallback(page);

		const
			windowY = await getComponentWindowYPos(component),
			halfPageHeight = await page.evaluate(() => Math.round(innerHeight / 2));

		expect(windowY).toBe(halfPageHeight);
	});

	test('sticks to the closest step on a fast pull-up', async ({page}) => {
		const component = await renderBottomSlide(page, {
			heightMode: 'full',
			visible: 100,
			steps: [50]
		});

		await gesture.evaluate((ctx) =>
			ctx.swipe(ctx.buildSteps(3, 20, globalThis.innerHeight, 0, -20)));

		await BOM.waitForIdleCallback(page);

		const
			windowY = await getComponentWindowYPos(component),
			halfPageHeight = await page.evaluate(() => Math.round(innerHeight / 2));

		expect(windowY).toBe(halfPageHeight);
	});

	test('skips all the steps on a full pull-up', async ({page}) => {
		const component = await renderBottomSlide(page, {
			heightMode: 'full',
			visible: 100,
			steps: [30, 50, 60]
		});

		await gesture.evaluate((ctx) =>
			ctx.swipe(ctx.buildSteps(7, 20, globalThis.innerHeight, 0, -100, {pause: 200})));

		await BOM.waitForIdleCallback(page);

		const
			windowTopOffset = await getAbsoluteComponentWindowOffset(component),
			maxWindowHeight = await getAbsolutePageHeight(page, INITIAL_MAX_VISIBLE_PERCENT);

		expect(windowTopOffset).toBe(maxWindowHeight);
	});

	test('does not skips any steps before a full pull-up', async ({page}) => {
		const
			steps = [30, 60];

		const component = await renderBottomSlide(page, {
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

	test('cannot be pulled more than the maximum height', async ({page}) => {
		const
			contentHeight = 300;

		await page.addStyleTag({content: `
			.b-bottom-slide__view {background-color: green;}
			#test-div {height: ${contentHeight}px !important;}
		`});

		const component = await renderBottomSlide(page, {
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
