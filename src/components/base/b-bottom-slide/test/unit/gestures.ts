/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';

import test from 'tests/config/unit/test';

import DOM from 'tests/helpers/dom';
import BOM from 'tests/helpers/bom';
import Gestures from 'tests/helpers/gestures';

import type GesturesInterface from 'core/prelude/test-env/gestures';

import {

	renderBottomSlide,
	getAbsoluteComponentWindowOffset,
	getComponentWindowYPos,
	getAbsolutePageHeight,
	open

} from 'components/base/b-bottom-slide/test/helpers';

test.use({
	isMobile: true,
	viewport: {
		width: 375,
		height: 667
	}
});

test.describe('<b-bottom-slide> gestures', () => {
	const
		initialMaxVisiblePercent = 90,
		selector = DOM.elNameSelectorGenerator('b-bottom-slide', 'view');

	let
		gestures: JSHandle<GesturesInterface>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		gestures = await Gestures.create(page, {
			dispatchEl: selector,
			targetEl: selector
		});

		await page.addStyleTag({
			content: '#test-div {height: 3000px;}'
		});
	});

	test('should open via a fast swipe', async ({page}) => {
		const component = await renderBottomSlide(page, {
			heightMode: 'full',
			visible: 200
		});

		await gestures
			.evaluate((ctx) => ctx.swipe(ctx.buildSteps(3, 20, globalThis.innerHeight, 0, -20)));

		const
			windowTopOffset = await getAbsoluteComponentWindowOffset(component),
			maxWindowHeight = await getAbsolutePageHeight(page, initialMaxVisiblePercent),
			openedModVal = await component.evaluate(({mods}) => mods.opened);

		test.expect(windowTopOffset).toBe(maxWindowHeight);
		test.expect(openedModVal).toBe('true');
	});

	test('should open via a slow pull-up', async ({page}) => {
		const component = await renderBottomSlide(page, {
			heightMode: 'full',
			visible: 200
		});

		await gestures.evaluate((ctx) =>
			ctx.swipe(ctx.buildSteps(6, 20, globalThis.innerHeight, 0, -100, {pause: 200})));

		const
			windowTopOffset = await getAbsoluteComponentWindowOffset(component),
			maxWindowHeight = await getAbsolutePageHeight(page, initialMaxVisiblePercent),
			openedModVal = await component.evaluate(({mods}) => mods.opened);

		test.expect(windowTopOffset).toBe(maxWindowHeight);
		test.expect(openedModVal).toBe('true');
	});

	test('should stop tracking gestures on the content block when content swipes tracking disabled', async ({page}) => {
		const component = await renderBottomSlide(page, {
			heightMode: 'content',
			trackContentSwipes: false,
			visible: 80
		});

		await open(page, component);

		const
			windowY = await getComponentWindowYPos(component);

		await gestures.evaluate((ctx, windowY) =>
			ctx.swipe(ctx.buildSteps(5, 40, windowY + 20, 0, 30)), windowY);

		const
			openedModVal = await component.evaluate(({mods}) => mods.opened);

		test.expect(openedModVal).toBe('true');
	});

	test('should pull up the window when the cursor moves up', async ({page}) => {
		const component = await renderBottomSlide(page, {
			heightMode: 'full',
			visible: 200
		});

		await gestures.evaluate((ctx) =>
			ctx.swipe(ctx.buildSteps(3, 20, globalThis.innerHeight, 0, -100), false));

		await BOM.waitForIdleCallback(page);

		const
			windowTopOffset = await getAbsoluteComponentWindowOffset(component);

		test.expect(windowTopOffset).toBe(400);
	});

	test('should close via a fast swipe', async ({page}) => {
		const component = await renderBottomSlide(page, {
			heightMode: 'full'
		});

		await open(page, component);

		const
			windowY = await getComponentWindowYPos(component);

		await gestures.evaluate((ctx, windowY) =>
			ctx.swipe(ctx.buildSteps(5, 40, windowY + 20, 0, 30)), windowY);

		const
			currentWindowTopOffset = await getAbsoluteComponentWindowOffset(component),
			openedModVal = await component.evaluate(({mods}) => mods.opened);

		test.expect(currentWindowTopOffset).toBe(0);
		test.expect(openedModVal).toBe('false');
	});

	test('should close via a slow pull-down', async ({page}) => {
		const component = await renderBottomSlide(page, {
			heightMode: 'full'
		});

		await open(page, component);

		const
			windowY = await getComponentWindowYPos(component);

		await gestures.evaluate((ctx, windowY) =>
			ctx.swipe(ctx.buildSteps(6, 40, windowY + 20, 0, 100, {pause: 200})), windowY);

		const
			currentWindowTopOffset = await getAbsoluteComponentWindowOffset(component),
			openedModVal = await component.evaluate(({mods}) => mods.opened);

		test.expect(currentWindowTopOffset).toBe(0);
		test.expect(openedModVal).toBe('false');
	});

	test('should pull down the window when the cursor moves down', async ({page}) => {
		const component = await renderBottomSlide(page, {
			heightMode: 'full'
		});

		await open(page, component);

		const
			windowY = await getComponentWindowYPos(component);

		await gestures.evaluate((ctx, windowY) =>
			ctx.swipe(ctx.buildSteps(3, 40, windowY + 20, 0, 100, {pause: 200}), false), windowY);

		await BOM.waitForIdleCallback(page);

		const
			windowTopOffset = await getAbsoluteComponentWindowOffset(component);

		test.expect(windowTopOffset).toBe(400);
	});

	test('should stick to the closest step on a slow pull-up', async ({page}) => {
		const component = await renderBottomSlide(page, {
			heightMode: 'full',
			visible: 100,
			steps: [50]
		});

		await gestures.evaluate((ctx) =>
			ctx.swipe(ctx.buildSteps(4, 20, globalThis.innerHeight, 0, -100, {pause: 200})));

		await BOM.waitForIdleCallback(page);

		const
			windowY = await getComponentWindowYPos(component),
			halfPageHeight = await page.evaluate(() => Math.round(innerHeight / 2));

		test.expect(windowY).toBe(halfPageHeight);
	});

	test('should stick to the closest step on a fast pull-up', async ({page}) => {
		const component = await renderBottomSlide(page, {
			heightMode: 'full',
			visible: 100,
			steps: [50]
		});

		await gestures.evaluate((ctx) =>
			ctx.swipe(ctx.buildSteps(3, 20, globalThis.innerHeight, 0, -20)));

		await BOM.waitForIdleCallback(page);

		const
			windowY = await getComponentWindowYPos(component),
			halfPageHeight = await page.evaluate(() => Math.round(innerHeight / 2));

		test.expect(windowY).toBe(halfPageHeight);
	});

	test('should skip all the steps on a full pull-up', async ({page}) => {
		const component = await renderBottomSlide(page, {
			heightMode: 'full',
			visible: 100,
			steps: [30, 50, 60]
		});

		await gestures.evaluate((ctx) =>
			ctx.swipe(ctx.buildSteps(7, 20, globalThis.innerHeight, 0, -100, {pause: 200})));

		await BOM.waitForIdleCallback(page);

		const
			windowTopOffset = await getAbsoluteComponentWindowOffset(component),
			maxWindowHeight = await getAbsolutePageHeight(page, initialMaxVisiblePercent);

		test.expect(windowTopOffset).toBe(maxWindowHeight);
	});

	test('should not skip any steps before a full pull-up', async ({page}) => {
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

		await gestures.evaluate((ctx) =>
			ctx.swipe(ctx.buildSteps(2, 20, globalThis.innerHeight, 0, -100, {pause: 200})));

		let
			windowTopOffset = await getAbsoluteComponentWindowOffset(component);

		test.expect(windowTopOffset).toBe(window30PercentOfHeight);

		await gestures.evaluate((ctx) =>
			ctx.swipe(ctx.buildSteps(2, 20, globalThis.innerHeight - 200, 0, -100, {pause: 200})));

		windowTopOffset = await getAbsoluteComponentWindowOffset(component);

		test.expect(windowTopOffset).toBe(window60PercentOfHeight);
	});

	test('should not be pulled more than the maximum height', async ({page}) => {
		const
			contentHeight = 300;

		await page.addStyleTag({content: `
			${selector} {background-color: green;}
			#test-div {height: ${contentHeight}px !important;}
		`});

		const component = await renderBottomSlide(page, {
			heightMode: 'content',
			visible: 80
		});

		await gestures.evaluate((ctx) =>
			ctx.swipe(ctx.buildSteps(5, 20, globalThis.innerHeight - 80, 0, -100, {pause: 200}), false));

		const
			windowTopOffset = await getAbsoluteComponentWindowOffset(component);

		test.expect(windowTopOffset).toBe(contentHeight);
	});
});
