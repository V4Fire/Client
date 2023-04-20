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
	getComponentWindowYPos,

	open,
	close,
	prev,
	next

} from 'components/base/b-bottom-slide/test/helpers';

test.use({
	isMobile: true,
	viewport: {
		width: 375,
		height: 667
	}
});

test.describe('<b-bottom-slide> events', () => {
	const
		selector = DOM.elNameSelectorGenerator('b-bottom-slide', 'view');

	let
		gestures: JSHandle<GesturesInterface>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		gestures = await Gestures.create(page, {
			dispatchEl: selector,
			targetEl: selector
		});
	});

	test.describe('should emit `open`', () => {
		test('when `open` method is invoked', async ({page}) => {
			const component = await renderBottomSlide(page, {
				heightMode: 'full'
			});

			const
				pr = component.evaluate((ctx) => ctx.promisifyOnce('open'));

			await open(page, component);

			await test.expect(pr).toBeResolved();
		});

		test('on swipe', async ({page}) => {
			const component = await renderBottomSlide(page, {
				heightMode: 'full',
				visible: 160
			});

			const
				pr = component.evaluate((ctx) => ctx.promisifyOnce('open'));

			await gestures.evaluate((ctx) =>
				ctx.swipe(ctx.buildSteps(3, 20, globalThis.innerHeight, 0, -20)));

			await test.expect(pr).toBeResolved();
		});
	});

	test.describe('should emit `close`', () => {
		test('when the `close` method is invoked', async ({page}) => {
			const component = await renderBottomSlide(page, {
				heightMode: 'full'
			});

			const
				pr = component.evaluate((ctx) => ctx.promisifyOnce('close'));

			await open(page, component);
			await close(page, component);

			await test.expect(pr).toBeResolved();
		});

		test('on swipe', async ({page}) => {
			const component = await renderBottomSlide(page, {
				heightMode: 'full'
			});

			const
				pr = component.evaluate((ctx) => ctx.promisifyOnce('close'));

			await open(page, component);

			const
				windowY = await getComponentWindowYPos(component);

			await gestures.evaluate((ctx, windowY) =>
				ctx.swipe(ctx.buildSteps(6, 40, windowY + 20, 0, 100, {pause: 200})), windowY);

			await test.expect(pr).toBeResolved();
		});
	});

	test.describe('should emit `stepChange`', () => {
		test('when the `next` method is invoked', async ({page}) => {
			const component = await renderBottomSlide(page, {
				heightMode: 'full',
				steps: [20, 40]
			});

			const
				pr = component.evaluate((ctx) => ctx.promisifyOnce('stepChange'));

			await open(page, component);
			await next(page, component);

			await test.expect(pr).toBeResolved();
		});

		test('when the `prev` method is invoked', async ({page}) => {
			const component = await renderBottomSlide(page, {
				heightMode: 'full',
				steps: [20, 40]
			});

			const
				pr = component.evaluate((ctx) => ctx.promisifyOnce('stepChange'));

			await open(page, component);
			await next(page, component);
			await prev(page, component);

			await test.expect(pr).toBeResolved();
		});

		test('on swipe', async ({page}) => {
			const component = await renderBottomSlide(page, {
				heightMode: 'full',
				visible: 100,
				steps: [50]
			});

			const
				pr = component.evaluate((ctx) => ctx.promisifyOnce('stepChange'));

			await gestures.evaluate((ctx) =>
				ctx.swipe(ctx.buildSteps(4, 20, globalThis.innerHeight, 0, -100, {pause: 200})));

			await BOM.waitForIdleCallback(page);

			await test.expect(pr).toBeResolved();
		});
	});

	test('should emit `moveStateChange` on swipe', async ({page}) => {
		const component = await renderBottomSlide(page, {
			heightMode: 'full',
			visible: 200
		});

		const
			pr = component.evaluate((ctx) => ctx.promisifyOnce('moveStateChange'));

		await gestures.evaluate((ctx) =>
			ctx.swipe(ctx.buildSteps(3, 20, globalThis.innerHeight, 0, -100), false));

		await test.expect(pr).toBeResolved();
	});
});
