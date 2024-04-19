/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable max-lines-per-function */
import sharp from 'sharp';

import test from 'tests/config/unit/test';

import { BOM, RequestInterceptor } from 'tests/helpers';

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

	test('should be hidden by default', async ({page}) => {
		const component = await renderBottomSlide(page, {
			heightMode: 'content'
		});

		const
			windowTopOffset = await getAbsoluteComponentWindowOffset(component);

		test.expect(windowTopOffset).toBe(0);
	});

	test.describe('`heightMode`', () => {
		test.describe('`content`', () => {
			test('should calculate height using the provided content height', async ({page}) => {
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

			test('window size should not exceed the screen height when the content height is greater than the screen height', async ({page}) => {
				await page.addStyleTag({
					content: '#test-div {height: 3000px;}'
				});

				const component = await renderBottomSlide(page, {
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
			test('should open the window to its full height, regardless of the height of the content', async ({page}) => {
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
		test.describe('`[20, 50]`', () => {
			test('should stop at 20 and 50 percent before fully opening', async ({page}) => {
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
		});

		test.describe('`[50]`', () => {
			test('should stop at 50 percent before fully opening', async ({page}) => {
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

			test('should stop at 50 percent and after that should fully open', async ({page}) => {
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
	});

	test.describe('`visible`', () => {
		test('should be `100px` visible', async ({page}) => {
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

		test('should be `0px` visible', async ({page}) => {
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
		test('can be pulled up to `50%` of component height', async ({page}) => {
			const
				maxVisiblePercent = 50;

			await page.addStyleTag({
				content: '#test-div {height: 3000px;}'
			});

			const component = await renderBottomSlide(page, {
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
		test('should not have overlay if prop is `false`', async ({page}) => {
			const component = await renderBottomSlide(page, {
				heightMode: 'full',
				overlay: false
			});

			await open(page, component);

			const
				hasOverlay = await component.evaluate((ctx) => Boolean(ctx.unsafe.block!.element('overlay')));

			test.expect(hasOverlay).toBeFalsy();
		});

		test('should have overlay if prop is `true`', async ({page}) => {
			const component = await renderBottomSlide(page, {
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
		test('overlay should have opacity equal to `0.3`', async ({page}) => {
			const
				maxOpacity = 0.3;

			const component = await renderBottomSlide(page, {
				heightMode: 'full',
				maxOpacity
			});

			await open(page, component);

			const opacityVal = await component
				.evaluate((ctx) => Number((<HTMLElement>ctx.unsafe.block!.element('overlay'))!.style.opacity));

			test.expect(opacityVal).toBe(maxOpacity);
		});

		test('overlay should have opacity equal to `1`', async ({page}) => {
			const
				maxOpacity = 1;

			const component = await renderBottomSlide(page, {
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
		test('should always render content when prop is `true`', async ({page}) => {
			const component = await renderBottomSlide(page, {
				heightMode: 'full',
				forceInnerRender: true
			});

			const
				hasContent = await component.evaluate(() => Boolean(document.getElementById('test-div')));

			test.expect(hasContent).toBeTruthy();
		});

		test('should not render content when prop is `false` and component is closed', async ({page}) => {
			const component = await renderBottomSlide(page, {
				heightMode: 'full',
				forceInnerRender: false
			});

			const
				hasContent = await component.evaluate(() => Boolean(document.getElementById('test-div')));

			test.expect(hasContent).toBeFalsy();
		});

		test('should render the content when prop is `false` after open is invoked', async ({page}) => {
			const component = await renderBottomSlide(page, {
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
		test.describe('should be `true`', () => {
			test('when the window is fully opened', async ({page}) => {
				const component = await renderBottomSlide(page, {
					heightMode: 'full'
				});

				await open(page, component);

				const
					testVal = await component.evaluate((ctx) => ctx.isFullyOpened);

				test.expect(testVal).toBeTruthy();
			});
		});

		test.describe('should be `false`', () => {
			test('when the window is closed', async ({page}) => {
				const component = await renderBottomSlide(page, {
					heightMode: 'full'
				});

				const
					testVal = await component.evaluate((ctx) => ctx.isFullyOpened);

				test.expect(testVal).toBeFalsy();
			});

			test('when the window is opened at the intermediate step', async ({page}) => {
				const component = await renderBottomSlide(page, {
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
		test.describe('should be `true`', () => {
			test('when the window is closed', async ({page}) => {
				const component = await renderBottomSlide(page, {
					heightMode: 'full'
				});

				const
					testVal = await component.evaluate((ctx) => ctx.isClosed);

				test.expect(testVal).toBeTruthy();
			});
		});

		test.describe('should be `false`', () => {
			test('when the window is opened', async ({page}) => {
				const component = await renderBottomSlide(page, {
					heightMode: 'full'
				});

				await open(page, component);

				const
					testVal = await component.evaluate((ctx) => ctx.isClosed);

				test.expect(testVal).toBeFalsy();
			});

			test('when the window is opened at the intermediate step', async ({page}) => {
				const component = await renderBottomSlide(page, {
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
		test('should open fully without `steps` provided', async ({page}) => {
			const component = await renderBottomSlide(page, {
				heightMode: 'full'
			});

			await open(page, component);

			const
				windowTopOffset = await getAbsoluteComponentWindowOffset(component),
				maxWindowHeight = await getAbsolutePageHeight(page, initialMaxVisiblePercent);

			test.expect(windowTopOffset).toBe(maxWindowHeight);
		});

		test('should open at first step with `steps` provided', async ({page}) => {
			const
				step = 20;

			const component = await renderBottomSlide(page, {
				heightMode: 'full',
				steps: [step]
			});

			await open(page, component);

			const
				windowTopOffset = await getAbsoluteComponentWindowOffset(component),
				step1Absolute = await getAbsolutePageHeight(page, step);

			test.expect(windowTopOffset).toBe(step1Absolute);
		});

		test('should set the `opened` modifier', async ({page}) => {
			const component = await renderBottomSlide(page, {
				heightMode: 'full'
			});

			await open(page, component);

			const
				testVal = await component.evaluate((ctx) => ctx.mods.opened);

			test.expect(testVal).toBe('true');
		});

		test('should remove the `hidden` modifier', async ({page}) => {
			const component = await renderBottomSlide(page, {
				heightMode: 'full'
			});

			await open(page, component);

			const
				testVal = await component.evaluate((ctx) => ctx.mods.hidden);

			test.expect(testVal).toBeUndefined();
		});
	});

	test.describe('`close`', () => {
		test('should close the window', async ({page}) => {
			const component = await renderBottomSlide(page, {
				heightMode: 'full'
			});

			await open(page, component);
			await close(page, component);

			const
				windowTopOffset = await getAbsoluteComponentWindowOffset(component);

			test.expect(windowTopOffset).toBe(0);
		});

		test('should close the window fully with `steps` provided', async ({page}) => {
			const component = await renderBottomSlide(page, {
				heightMode: 'full',
				steps: [20, 40, 60]
			});

			await open(page, component, 2);
			await close(page, component);

			const
				windowTopOffset = await getAbsoluteComponentWindowOffset(component);

			test.expect(windowTopOffset).toBe(0);
		});

		test('should set the `opened` modifier to `false`', async ({page}) => {
			const component = await renderBottomSlide(page, {
				heightMode: 'full'
			});

			await open(page, component);
			await close(page, component);

			const
				testVal = await component.evaluate((ctx) => ctx.mods.opened);

			test.expect(testVal).toBe('false');
		});

		test('should set the `hidden` modifier to `true`', async ({page}) => {
			const component = await renderBottomSlide(page, {
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

		test('should open the window at the first step', async ({page}) => {
			const component = await renderBottomSlide(page, {
				heightMode: 'full',
				steps
			});

			await next(page, component);

			const
				windowTopOffset = await getAbsoluteComponentWindowOffset(component),
				step1Absolute = await getAbsolutePageHeight(page, steps[0]);

			test.expect(windowTopOffset).toBe(step1Absolute);
		});

		test('should move the window to the next step', async ({page}) => {
			const component = await renderBottomSlide(page, {
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

		test('should do nothing if the window is fully opened', async ({page}) => {
			const component = await renderBottomSlide(page, {
				heightMode: 'full',
				steps
			});

			await open(page, component);

			await next(page, component);
			await next(page, component);
			await next(page, component);

			test.expect(await component.evaluate((ctx) => ctx.isFullyOpened)).toBeTruthy();

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

		test('should close the window when it\'s opened at the first step', async ({page}) => {
			const component = await renderBottomSlide(page, {
				heightMode: 'full',
				steps
			});

			await open(page, component);
			await prev(page, component);

			const
				windowTopOffset = await getAbsoluteComponentWindowOffset(component);

			test.expect(await component.evaluate((ctx) => ctx.isClosed)).toBeTruthy();
			test.expect(windowTopOffset).toBe(0);
		});

		test('should move the window to the previous step', async ({page}) => {
			const component = await renderBottomSlide(page, {
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

		test('should do nothing if the window is fully closed', async ({page}) => {
			const component = await renderBottomSlide(page, {
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
		test('should recalculate the window geometry on DOM change', async ({page}) => {
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

		test('should recalculate the window geometry after image loading', async ({page}) => {
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
				imageSize = 300,
				fakeImgUrl = 'https://fake-image.get';

			const image = await sharp({
				create: {
					width: imageSize,
					height: imageSize,
					channels: 4,
					background: {r: 255, g: 0, b: 0, alpha: 0.5}
				}
			}).png().toBuffer();

			const
				interceptor = new RequestInterceptor(page, fakeImgUrl);

			interceptor.response(200, image, {contentType: 'image/png'});

			await interceptor.start();
			await interceptor.responder();

			await component.evaluate((_, fakeImgUrl) => {
				const
					el = document.getElementById('test-div'),
					newEl = document.createElement('img');

				newEl.src = fakeImgUrl;
				newEl.style.display = 'block';
				el?.insertAdjacentElement('afterend', newEl);
			}, fakeImgUrl);

			await BOM.waitForIdleCallback(page, {sleepAfterIdles: 200});

			const windowTopOffset = await getAbsoluteComponentWindowOffset(component);
			test.expect(windowTopOffset).toBe(contentHeight);

			await interceptor.respond();

			await test.expect.poll(() => getAbsoluteComponentWindowOffset(component))
				.toBe(contentHeight + imageSize);
		});
	});
});
