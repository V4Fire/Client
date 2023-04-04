/* eslint-disable max-lines-per-function */

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import {

	renderBottomSlide,

	getAbsoluteComponentWindowOffset,
	getAbsoluteComponentWindowHeight,
	getAbsolutePageHeight,

	open,
	close,

	prev,
	next

} from 'components/base/b-bottom-slide/test/helpers';
import BOM from 'tests/helpers/bom';

test.use({
	isMobile: true,
	viewport: {
		width: 375,
		height: 667
	}
});

test.describe('<b-bottom-slide> functional cases', () => {
	const initialMaxVisiblePercent = 90;

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test.describe('`heightMode`', () => {
		test.describe('`content`', () => {
			// FIXME: test is broken
			test('height calculation is based on the provided content height', async ({page}) => {
				const
					contentHeight = 40;

				await page.addStyleTag({
					content: `#test-div {height: ${contentHeight}px;}`
				});

				const component = await renderBottomSlide(page, {
					heightMode: 'content'
				});

				await open(page, component);

				const
					windowTopOffset = await getAbsoluteComponentWindowOffset(component);

				test.expect(windowTopOffset).toBe(contentHeight);
			});

			test('if the content height is greater than the screen height - the window size does not exceed the screen height', async ({page}) => {
				await page.addStyleTag({
					content: '#test-div {height: 3000px;}'
				});

				const component = await renderBottomSlide(page,
					{
						heightMode: 'content',
						maxVisiblePercent: initialMaxVisiblePercent
					});

				await open(page, component);

				const
					windowHeight = await getAbsoluteComponentWindowHeight(component),
					maxWindowHeight = await getAbsolutePageHeight(page, initialMaxVisiblePercent);

				test.expect(windowHeight).toBe(maxWindowHeight);
			});
		});

		test.describe('`full`', () => {
			test('opens the window to its full height, regardless of the height of the content', async ({page}) => {
				const component = await renderBottomSlide(page, {
					heightMode: 'full'
				});

				await open(page, component);

				const
					windowTopOffset = await getAbsoluteComponentWindowOffset(component),
					maxWindowHeight = await getAbsolutePageHeight(page, initialMaxVisiblePercent);

				test.expect(windowTopOffset).toBe(maxWindowHeight);
			});
		});
	});

	test.describe('`steps`', () => {
		test('`[20, 50]` stops at 20 and 50 percent before fully opening', async ({page}) => {
			const
				steps = [20, 50];

			const component = await renderBottomSlide(page, {
				heightMode: 'full',
				steps
			});

			const
				step1Absolute = await getAbsolutePageHeight(page, steps[0]),
				step2Absolute = await getAbsolutePageHeight(page, steps[1]);

			await open(page, component);

			const
				step1WindowOffset = await getAbsoluteComponentWindowOffset(component);

			test.expect(step1WindowOffset).toBe(step1Absolute);

			await next(page, component);

			const
				step2WindowOffset = await getAbsoluteComponentWindowOffset(component);

			test.expect(step2WindowOffset).toBe(step2Absolute);
		});

		test('`[50]` stops at 50 percent before fully opening', async ({page}) => {
			const
				steps = [50];

			const component = await renderBottomSlide(page, {
				heightMode: 'full',
				steps
			});

			const
				step1Absolute = await getAbsolutePageHeight(page, steps[0]);

			await open(page, component);

			const
				step1WindowOffset = await getAbsoluteComponentWindowOffset(component);

			test.expect(step1WindowOffset).toBe(step1Absolute);
		});

		test('`[50]` stops at 50 percent and after that are fully opens', async ({page}) => {
			const
				steps = [50];

			const component = await renderBottomSlide(page, {
				heightMode: 'full',
				steps
			});

			await open(page, component);
			await next(page, component);

			const
				windowTopOffset = await getAbsoluteComponentWindowOffset(component),
				maxWindowHeight = await getAbsolutePageHeight(page, initialMaxVisiblePercent);

			test.expect(windowTopOffset).toBe(maxWindowHeight);
		});
	});

	test.describe('`visible`', () => {
		test('`100`', async ({page}) => {
			const
				visibleVal = 100;

			const component = await renderBottomSlide(page, {
				heightMode: 'full',
				visible: visibleVal
			});

			const
				windowTopOffset = await getAbsoluteComponentWindowOffset(component);

			test.expect(windowTopOffset).toBe(visibleVal);
		});

		test('`0`', async ({page}) => {
			const
				visibleVal = 0;

			const component = await renderBottomSlide(page, {
				heightMode: 'full',
				visible: visibleVal
			});

			const
				windowTopOffset = await getAbsoluteComponentWindowOffset(component);

			test.expect(windowTopOffset).toBe(visibleVal);
		});
	});

	test.describe('`maxVisiblePercent`', () => {
		// FIXME: test is broken
		test('`50`', async ({page}) => {
			const
				maxVisiblePercent = 50;

			await page.addStyleTag({
				content: '#test-div {height: 3000px;}'
			});

			const component = await renderBottomSlide(page,
				{
					heightMode: 'content',
					maxVisiblePercent
				});

			await open(page, component);

			const
				windowTopOffset = await getAbsoluteComponentWindowOffset(component),
				maxWindowHeight = await getAbsolutePageHeight(page, maxVisiblePercent);

			test.expect(windowTopOffset).toBe(maxWindowHeight);
		});
	});

	test.describe('`overlay`', () => {
		test('`false`', async ({page}) => {
			const component = await renderBottomSlide(page,
				{
					heightMode: 'full',
					overlay: false
				});

			await open(page, component);

			const
				hasOverlay = await component.evaluate((ctx) => Boolean(ctx.unsafe.block!.element('overlay')));

			test.expect(hasOverlay).toBeFalsy();
		});

		test('`true`', async ({page}) => {
			const component = await renderBottomSlide(page,
				{
					heightMode: 'full',
					overlay: true
				});

			await open(page, component);

			const
				hasOverlay = await component.evaluate((ctx) => Boolean(ctx.unsafe.block!.element('overlay')));

			test.expect(hasOverlay).toBeTruthy();
		});
	});

	test.describe('`maxOpacity`', () => {
		test('`0.3`', async ({page}) => {
			const
				maxOpacity = 0.3;

			const component = await renderBottomSlide(page,
				{
					heightMode: 'full',
					maxOpacity
				});

			await open(page, component);

			const opacityVal = await component
				.evaluate((ctx) => Number((<HTMLElement>ctx.unsafe.block!.element('overlay'))!.style.opacity));

			test.expect(opacityVal).toBe(maxOpacity);
		});

		test('`1`', async ({page}) => {
			const
				maxOpacity = 1;

			const component = await renderBottomSlide(page,
				{
					heightMode: 'full',
					maxOpacity
				});

			await open(page, component);

			const opacityVal = await component
				.evaluate((ctx) => Number((<HTMLElement>ctx.unsafe.block!.element('overlay'))!.style.opacity));

			test.expect(opacityVal).toBe(maxOpacity);
		});
	});

	test.describe('`forceInnerRender`', () => {
		test('`true`', async ({page}) => {
			const component = await renderBottomSlide(page,
				{
					heightMode: 'full',
					forceInnerRender: true
				});

			const
				hasContent = await component.evaluate(() => Boolean(document.getElementById('test-div')));

			test.expect(hasContent).toBeTruthy();
		});

		test('`false`', async ({page}) => {
			const component = await renderBottomSlide(page,
				{
					heightMode: 'full',
					forceInnerRender: false
				});

			const
				hasContent = await component.evaluate(() => Boolean(document.getElementById('test-div')));

			test.expect(hasContent).toBeFalsy();
		});

		test('`false` renders the content after open has been called', async ({page}) => {
			const component = await renderBottomSlide(page,
				{
					heightMode: 'full',
					forceInnerRender: false
				});

			await open(page, component);

			const
				hasContent = await component.evaluate(() => Boolean(document.getElementById('test-div')));

			test.expect(hasContent).toBeTruthy();
		});
	});

	test.describe('`isFullyOpened`', () => {
		test.describe('`true`', () => {
			test('if the window is fully opened', async ({page}) => {
				const component = await renderBottomSlide(page,
					{
						heightMode: 'full'
					});

				await open(page, component);

				const
					testVal = await component.evaluate((ctx) => ctx.isFullyOpened);

				test.expect(testVal).toBeTruthy();
			});
		});

		test.describe('`false`', () => {
			test('if the window is closed', async ({page}) => {
				const component = await renderBottomSlide(page,
					{
						heightMode: 'full'
					});

				const
					testVal = await component.evaluate((ctx) => ctx.isFullyOpened);

				test.expect(testVal).toBeFalsy();
			});

			test('if the window is stuck to an intermediate step', async ({page}) => {
				const component = await renderBottomSlide(page,
					{
						heightMode: 'full',
						steps: [50]
					});

				await open(page, component);

				const
					testVal = await component.evaluate((ctx) => ctx.isFullyOpened);

				test.expect(testVal).toBeFalsy();
			});
		});
	});

	test.describe('`isClosed`', () => {
		test.describe('`true`', () => {
			test('if the window is closed', async ({page}) => {
				const component = await renderBottomSlide(page,
					{
						heightMode: 'full'
					});

				const
					testVal = await component.evaluate((ctx) => ctx.isClosed);

				test.expect(testVal).toBeTruthy();
			});
		});

		test.describe('`false`', () => {
			test('if the window is opened', async ({page}) => {
				const component = await renderBottomSlide(page,
					{
						heightMode: 'full'
					});

				await open(page, component);

				const
					testVal = await component.evaluate((ctx) => ctx.isClosed);

				test.expect(testVal).toBeFalsy();
			});

			test('if the window is stuck to an intermediate step', async ({page}) => {
				const component = await renderBottomSlide(page,
					{
						heightMode: 'full',
						steps: [20]
					});

				await open(page, component);

				const
					testVal = await component.evaluate((ctx) => ctx.isClosed);

				test.expect(testVal).toBeFalsy();
			});
		});
	});

	test.describe('`open`', () => {
		test('without `steps` provided', async ({page}) => {
			const component = await renderBottomSlide(page,
				{
					heightMode: 'full'
				});

			await open(page, component);

			const
				windowTopOffset = await getAbsoluteComponentWindowOffset(component),
				maxWindowHeight = await getAbsolutePageHeight(page, initialMaxVisiblePercent);

			test.expect(windowTopOffset).toBe(maxWindowHeight);
		});

		test('with `steps` provided', async ({page}) => {
			const
				step = 20;

			const component = await renderBottomSlide(page,
				{
					heightMode: 'full',
					steps: [step]
				});

			await open(page, component);

			const
				windowTopOffset = await getAbsoluteComponentWindowOffset(component),
				step1Absolute = await getAbsolutePageHeight(page, step);

			test.expect(windowTopOffset).toBe(step1Absolute);
		});

		test('sets the `opened` modifier', async ({page}) => {
			const component = await renderBottomSlide(page,
				{
					heightMode: 'full'
				});

			await open(page, component);

			const
				testVal = await component.evaluate((ctx) => ctx.mods.opened);

			test.expect(testVal).toBe('true');
		});

		test('removes the `hidden` modifier', async ({page}) => {
			const component = await renderBottomSlide(page,
				{
					heightMode: 'full'
				});

			await open(page, component);

			const
				testVal = await component.evaluate((ctx) => ctx.mods.hidden);

			test.expect(testVal).toBeUndefined();
		});
	});

	test.describe('`close`', () => {
		test('closes the window', async ({page}) => {
			const component = await renderBottomSlide(page,
				{
					heightMode: 'full'
				});

			await open(page, component);
			await close(page, component);

			const
				windowTopOffset = await getAbsoluteComponentWindowOffset(component);

			test.expect(windowTopOffset).toBe(0);
		});

		test('closes the window with `steps` provided', async ({page}) => {
			const component = await renderBottomSlide(page,
				{
					heightMode: 'full',
					steps: [20, 40, 60]
				});

			await open(page, component, 2);
			await close(page, component);

			const
				windowTopOffset = await getAbsoluteComponentWindowOffset(component);

			test.expect(windowTopOffset).toBe(0);
		});

		test('sets the `opened` modifier to `false`', async ({page}) => {
			const component = await renderBottomSlide(page,
				{
					heightMode: 'full'
				});

			await open(page, component);
			await close(page, component);

			const
				testVal = await component.evaluate((ctx) => ctx.mods.opened);

			test.expect(testVal).toBe('false');
		});

		test('sets the `hidden` modifier', async ({page}) => {
			const component = await renderBottomSlide(page,
				{
					heightMode: 'full'
				});

			await open(page, component);
			await close(page, component);

			const
				testVal = await component.evaluate((ctx) => ctx.mods.hidden);

			test.expect(testVal).toBe('true');
		});
	});

	test.describe('`next`', () => {
		const
			steps = [20, 40, 60];

		test('opens the window', async ({page}) => {
			const component = await renderBottomSlide(page,
				{
					heightMode: 'full',
					steps
				});

			await next(page, component);

			const
				windowTopOffset = await getAbsoluteComponentWindowOffset(component),
				step1Absolute = await getAbsolutePageHeight(page, steps[0]);

			test.expect(windowTopOffset).toBe(step1Absolute);
		});

		test('moves the window to the next step', async ({page}) => {
			const component = await renderBottomSlide(page,
				{
					heightMode: 'full',
					steps
				});

			await open(page, component);
			await next(page, component);

			const
				windowTopOffset = await getAbsoluteComponentWindowOffset(component),
				step2Absolute = await getAbsolutePageHeight(page, steps[1]);

			test.expect(windowTopOffset).toBe(step2Absolute);
		});

		test('does nothing if the window is fully opened', async ({page}) => {
			const component = await renderBottomSlide(page,
				{
					heightMode: 'full',
					steps
				});

			await open(page, component);

			await next(page, component);
			await next(page, component);
			await next(page, component);
			await next(page, component);

			const
				windowTopOffset = await getAbsoluteComponentWindowOffset(component),
				maxWindowHeight = await getAbsolutePageHeight(page, initialMaxVisiblePercent);

			test.expect(windowTopOffset).toBe(maxWindowHeight);
		});
	});

	test.describe('`prev`', () => {
		const
			steps = [20, 40, 60];

		test('closes the window', async ({page}) => {
			const component = await renderBottomSlide(page,
				{
					heightMode: 'full',
					steps
				});

			await open(page, component);
			await prev(page, component);

			const
				windowTopOffset = await getAbsoluteComponentWindowOffset(component);

			test.expect(windowTopOffset).toBe(0);
		});

		test('moves the window to the previous step', async ({page}) => {
			const component = await renderBottomSlide(page,
				{
					heightMode: 'full',
					steps
				});

			await open(page, component);
			await next(page, component);
			await prev(page, component);

			const
				windowTopOffset = await getAbsoluteComponentWindowOffset(component),
				step1Absolute = await getAbsolutePageHeight(page, steps[0]);

			test.expect(windowTopOffset).toBe(step1Absolute);
		});

		test('does nothing if the window is fully closed', async ({page}) => {
			const component = await renderBottomSlide(page,
				{
					heightMode: 'full',
					steps
				});

			await prev(page, component);

			const
				windowTopOffset = await getAbsoluteComponentWindowOffset(component);

			test.expect(windowTopOffset).toBe(0);
		});
	});

	test.describe('`recalculateState`', () => {
		// FIXME: test is broken
		test('recalculates the window geometry', async ({page}) => {
			const
				contentHeight = 40;

			await page.addStyleTag({
				content: `#test-div {height: ${contentHeight}px;} .test-div {height: ${contentHeight}px}`
			});

			const component = await renderBottomSlide(page, {
				heightMode: 'content'
			});

			await open(page, component);

			await component.evaluate(() => {
				const
					el = document.getElementById('test-div'),
					newEl = document.createElement('div');

				newEl.classList.add('test-div');
				el?.insertAdjacentElement('afterend', newEl);
			});

			await BOM.waitForIdleCallback(page, {sleepAfterIdles: 200});

			const
				windowTopOffset = await getAbsoluteComponentWindowOffset(component);

			test.expect(windowTopOffset).toBe(contentHeight * 2);
		});
	});
});
