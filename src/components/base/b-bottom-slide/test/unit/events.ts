/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */
import type { JSHandle } from 'playwright';

import type GesturesInterface from 'core/prelude/test-env/gestures';
import Gestures from 'tests/helpers/gestures';
import test from 'tests/config/unit/test';

import {

	renderBottomSlide,
	getComponentWindowYPos,

	open,
	close,

	prev,
	next

} from 'components/base/b-bottom-slide/test/helpers';
import DOM from 'tests/helpers/dom';
import BOM from 'tests/helpers/bom';

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

	test.describe('emits `open`', () => {
		test('invokes the `open` method', async ({page}) => {
			const component = await renderBottomSlide(page, {
				heightMode: 'full'
			});

			const
				pr = component.evaluate((ctx) => ctx.promisifyOnce('open'));

			await open(page, component);

			await test.expect(pr).toBeResolved();
		});

		test('opening via a swipe', async ({page}) => {
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

	test.describe('`close`', () => {
		test('invokes the `close` method', async ({page}) => {
			const component = await renderBottomSlide(page, {
				heightMode: 'full'
			});

			const
				pr = component.evaluate((ctx) => ctx.promisifyOnce('close'));

			await open(page, component);
			await close(page, component);

			await test.expect(pr).toBeResolved();
		});

		test('closing via a swipe', async ({page}) => {
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

	test.describe('`stepChange`', () => {
		test('invokes the `next` method', async ({page}) => {
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

		test('invokes the `prev` method', async ({page}) => {
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

		test('step-changing via a swipe', async ({page}) => {
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

	test('`moveStateChange`', async ({page}) => {
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
