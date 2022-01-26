/* eslint-disable max-lines-per-function */

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

	getAbsoluteComponentWindowOffset,
	getAbsoluteComponentWindowHeight,
	getAbsolutePageHeight,

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
	const initialUrl = page.url();

	const
		INITIAL_MAX_VISIBLE_PERCENT = 90;

	let
		context;

	describe('b-bottom-slide functional cases', () => {
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
		});

		afterEach(() => context.close());

		it('by default is hidden', async () => {
			const [component] = await initBottomSlide({
				heightMode: 'content'
			});

			const
				windowTopOffset = await getAbsoluteComponentWindowOffset(component);

			expect(windowTopOffset).toBe(0);
		});

		describe('`heightMode`', () => {
			describe('`content`', () => {
				it('height calculation is based on the provided content height', async () => {
					const
						contentHeight = 40;

					await page.addStyleTag({
						content: `#test-div {height: ${contentHeight}px;}`
					});

					const [component] = await initBottomSlide({
						heightMode: 'content'
					});

					await open(component);

					const
						windowTopOffset = await getAbsoluteComponentWindowOffset(component);

					expect(windowTopOffset).toBe(contentHeight);
				});

				it('if the content height is greater than the screen height - the window size does not exceed the screen height', async () => {
					await page.addStyleTag({
						content: '#test-div {height: 3000px;}'
					});

					const [component] = await initBottomSlide(
						{
							heightMode: 'content',
							maxVisiblePercent: INITIAL_MAX_VISIBLE_PERCENT
						}
					);

					await open(component);

					const
						windowHeight = await getAbsoluteComponentWindowHeight(component),
						maxWindowHeight = await getAbsolutePageHeight(INITIAL_MAX_VISIBLE_PERCENT);

					expect(windowHeight).toBe(maxWindowHeight);
				});
			});

			describe('`full`', () => {
				it('opens the window to its full height, regardless of the height of the content', async () => {
					const [component] = await initBottomSlide({
						heightMode: 'full'
					});

					await open(component);

					const
						windowTopOffset = await getAbsoluteComponentWindowOffset(component),
						maxWindowHeight = await getAbsolutePageHeight(INITIAL_MAX_VISIBLE_PERCENT);

					expect(windowTopOffset).toBe(maxWindowHeight);
				});
			});
		});

		describe('`steps`', () => {
			it('`[20, 50]` stops at 20 and 50 percent before fully opening', async () => {
				const
					steps = [20, 50];

				const [component] = await initBottomSlide({
					heightMode: 'full',
					steps
				});

				const
					step1Absolute = await getAbsolutePageHeight(steps[0]),
					step2Absolute = await getAbsolutePageHeight(steps[1]);

				await open(component);

				const
					step1WindowOffset = await getAbsoluteComponentWindowOffset(component);

				expect(step1WindowOffset).toBe(step1Absolute);

				await next(component);

				const
					step2WindowOffset = await getAbsoluteComponentWindowOffset(component);

				expect(step2WindowOffset).toBe(step2Absolute);
			});

			it('`[50]` stops at 50 percent before fully opening', async () => {
				const
					steps = [50];

				const [component] = await initBottomSlide({
					heightMode: 'full',
					steps
				});

				const
					step1Absolute = await getAbsolutePageHeight(steps[0]);

				await open(component);

				const
					step1WindowOffset = await getAbsoluteComponentWindowOffset(component);

				expect(step1WindowOffset).toBe(step1Absolute);
			});

			it('`[50]` stops at 50 percent and after that are fully opens', async () => {
				const
					steps = [50];

				const [component] = await initBottomSlide({
					heightMode: 'full',
					steps
				});

				await open(component);
				await next(component);

				const
					windowTopOffset = await getAbsoluteComponentWindowOffset(component),
					maxWindowHeight = await getAbsolutePageHeight(INITIAL_MAX_VISIBLE_PERCENT);

				expect(windowTopOffset).toBe(maxWindowHeight);
			});
		});

		describe('`visible`', () => {
			it('`100`', async () => {
				const
					visibleVal = 100;

				const [component] = await initBottomSlide({
					heightMode: 'full',
					visible: visibleVal
				});

				const
					windowTopOffset = await getAbsoluteComponentWindowOffset(component);

				expect(windowTopOffset).toBe(visibleVal);
			});

			it('`0`', async () => {
				const
					visibleVal = 0;

				const [component] = await initBottomSlide({
					heightMode: 'full',
					visible: visibleVal
				});

				const
					windowTopOffset = await getAbsoluteComponentWindowOffset(component);

				expect(windowTopOffset).toBe(visibleVal);
			});
		});

		describe('`maxVisiblePercent`', () => {
			it('`50`', async () => {
				const
					maxVisiblePercent = 50;

				await page.addStyleTag({
					content: '#test-div {height: 3000px;}'
				});

				const [component] = await initBottomSlide(
					{
						heightMode: 'content',
						maxVisiblePercent
					}
				);

				await open(component);

				const
					windowTopOffset = await getAbsoluteComponentWindowOffset(component),
					maxWindowHeight = await getAbsolutePageHeight(maxVisiblePercent);

				expect(windowTopOffset).toBe(maxWindowHeight);
			});
		});

		describe('`overlay`', () => {
			it('`false`', async () => {
				const [component] = await initBottomSlide(
					{
						heightMode: 'full',
						overlay: false
					}
				);

				await open(component);

				const
					hasOverlay = await component.evaluate((ctx) => Boolean(ctx.block.element('overlay')));

				expect(hasOverlay).toBeFalse();
			});

			it('`true`', async () => {
				const [component] = await initBottomSlide(
					{
						heightMode: 'full',
						overlay: true
					}
				);

				await open(component);

				const
					hasOverlay = await component.evaluate((ctx) => Boolean(ctx.block.element('overlay')));

				expect(hasOverlay).toBeTrue();
			});
		});

		describe('`maxOpacity`', () => {
			it('`0.3`', async () => {
				const
					maxOpacity = 0.3;

				const [component] = await initBottomSlide(
					{
						heightMode: 'full',
						maxOpacity
					}
				);

				await open(component);

				const
					opacityVal = await component.evaluate((ctx) => Number(ctx.block.element('overlay').style.opacity));

				expect(opacityVal).toBe(maxOpacity);
			});

			it('`1`', async () => {
				const
					maxOpacity = 1;

				const [component] = await initBottomSlide(
					{
						heightMode: 'full',
						maxOpacity
					}
				);

				await open(component);

				const
					opacityVal = await component.evaluate((ctx) => Number(ctx.block.element('overlay').style.opacity));

				expect(opacityVal).toBe(maxOpacity);
			});
		});

		describe('`forceInnerRender`', () => {
			it('`true`', async () => {
				const [component] = await initBottomSlide(
					{
						heightMode: 'full',
						forceInnerRender: true
					}
				);

				const
					hasContent = await component.evaluate(() => Boolean(document.getElementById('test-div')));

				expect(hasContent).toBeTrue();
			});

			it('`false`', async () => {
				const [component] = await initBottomSlide(
					{
						heightMode: 'full',
						forceInnerRender: false
					}
				);

				const
					hasContent = await component.evaluate(() => Boolean(document.getElementById('test-div')));

				expect(hasContent).toBeFalse();
			});

			it('`false` renders the content after open has been called', async () => {
				const [component] = await initBottomSlide(
					{
						heightMode: 'full',
						forceInnerRender: false
					}
				);

				await open(component);

				const
					hasContent = await component.evaluate(() => Boolean(document.getElementById('test-div')));

				expect(hasContent).toBeTrue();
			});
		});

		describe('`isFullyOpened`', () => {
			describe('`true`', () => {
				it('if the window is fully opened', async () => {
					const [component] = await initBottomSlide(
						{
							heightMode: 'full'
						}
					);

					await open(component);

					const
						testVal = await component.evaluate((ctx) => ctx.isFullyOpened);

					expect(testVal).toBeTrue();
				});
			});

			describe('`false`', () => {
				it('if the window is closed', async () => {
					const [component] = await initBottomSlide(
						{
							heightMode: 'full'
						}
					);

					const
						testVal = await component.evaluate((ctx) => ctx.isFullyOpened);

					expect(testVal).toBeFalse();
				});

				it('if the window is stuck to an intermediate step', async () => {
					const [component] = await initBottomSlide(
						{
							heightMode: 'full',
							steps: [50]
						}
					);

					await open(component);

					const
						testVal = await component.evaluate((ctx) => ctx.isFullyOpened);

					expect(testVal).toBeFalse();
				});
			});
		});

		describe('`isClosed`', () => {
			describe('`true`', () => {
				it('if the window is closed', async () => {
					const [component] = await initBottomSlide(
						{
							heightMode: 'full'
						}
					);

					const
						testVal = await component.evaluate((ctx) => ctx.isClosed);

					expect(testVal).toBeTrue();
				});
			});

			describe('`false`', () => {
				it('if the window is opened', async () => {
					const [component] = await initBottomSlide(
						{
							heightMode: 'full'
						}
					);

					await open(component);

					const
						testVal = await component.evaluate((ctx) => ctx.isClosed);

					expect(testVal).toBeFalse();
				});

				it('if the window is stuck to an intermediate step', async () => {
					const [component] = await initBottomSlide(
						{
							heightMode: 'full',
							steps: [20]
						}
					);

					await open(component);

					const
						testVal = await component.evaluate((ctx) => ctx.isClosed);

					expect(testVal).toBeFalse();
				});
			});
		});

		describe('`open`', () => {
			it('without `steps` provided', async () => {
				const [component] = await initBottomSlide(
					{
						heightMode: 'full'
					}
				);

				await open(component);

				const
					windowTopOffset = await getAbsoluteComponentWindowOffset(component),
					maxWindowHeight = await getAbsolutePageHeight(INITIAL_MAX_VISIBLE_PERCENT);

				expect(windowTopOffset).toBe(maxWindowHeight);
			});

			it('with `steps` provided', async () => {
				const
					step = 20;

				const [component] = await initBottomSlide(
					{
						heightMode: 'full',
						steps: [step]
					}
				);

				await open(component);

				const
					windowTopOffset = await getAbsoluteComponentWindowOffset(component),
					step1Absolute = await getAbsolutePageHeight(step);

				expect(windowTopOffset).toBe(step1Absolute);
			});

			it('sets the `opened` modifier', async () => {
				const [component] = await initBottomSlide(
					{
						heightMode: 'full'
					}
				);

				await open(component);

				const
					testVal = await component.evaluate((ctx) => ctx.mods.opened);

				expect(testVal).toBe('true');
			});

			it('removes the `hidden` modifier', async () => {
				const [component] = await initBottomSlide(
					{
						heightMode: 'full'
					}
				);

				await open(component);

				const
					testVal = await component.evaluate((ctx) => ctx.mods.hidden);

				expect(testVal).toBeUndefined();
			});
		});

		describe('`close`', () => {
			it('closes the window', async () => {
				const [component] = await initBottomSlide(
					{
						heightMode: 'full'
					}
				);

				await open(component);
				await close(component);

				const
					windowTopOffset = await getAbsoluteComponentWindowOffset(component);

				expect(windowTopOffset).toBe(0);
			});

			it('closes the window with `steps` provided', async () => {
				const [component] = await initBottomSlide(
					{
						heightMode: 'full',
						steps: [20, 40, 60]
					}
				);

				await open(component, 2);
				await close(component);

				const
					windowTopOffset = await getAbsoluteComponentWindowOffset(component);

				expect(windowTopOffset).toBe(0);
			});

			it('sets the `opened` modifier to `false`', async () => {
				const [component] = await initBottomSlide(
					{
						heightMode: 'full'
					}
				);

				await open(component);
				await close(component);

				const
					testVal = await component.evaluate((ctx) => ctx.mods.opened);

				expect(testVal).toBe('false');
			});

			it('sets the `hidden` modifier', async () => {
				const [component] = await initBottomSlide(
					{
						heightMode: 'full'
					}
				);

				await open(component);
				await close(component);

				const
					testVal = await component.evaluate((ctx) => ctx.mods.hidden);

				expect(testVal).toBe('true');
			});
		});

		describe('`next`', () => {
			const
				steps = [20, 40, 60];

			it('opens the window', async () => {
				const [component] = await initBottomSlide(
					{
						heightMode: 'full',
						steps
					}
				);

				await next(component);

				const
					windowTopOffset = await getAbsoluteComponentWindowOffset(component),
					step1Absolute = await getAbsolutePageHeight(steps[0]);

				expect(windowTopOffset).toBe(step1Absolute);
			});

			it('moves the window to the next step', async () => {
				const [component] = await initBottomSlide(
					{
						heightMode: 'full',
						steps
					}
				);

				await open(component);
				await next(component);

				const
					windowTopOffset = await getAbsoluteComponentWindowOffset(component),
					step2Absolute = await getAbsolutePageHeight(steps[1]);

				expect(windowTopOffset).toBe(step2Absolute);
			});

			it('does nothing if the window is fully opened', async () => {
				const [component] = await initBottomSlide(
					{
						heightMode: 'full',
						steps
					}
				);

				await open(component);

				await next(component);
				await next(component);
				await next(component);
				await next(component);

				const
					windowTopOffset = await getAbsoluteComponentWindowOffset(component),
					maxWindowHeight = await getAbsolutePageHeight(INITIAL_MAX_VISIBLE_PERCENT);

				expect(windowTopOffset).toBe(maxWindowHeight);
			});
		});

		describe('`prev`', () => {
			const
				steps = [20, 40, 60];

			it('closes the window', async () => {
				const [component] = await initBottomSlide(
					{
						heightMode: 'full',
						steps
					}
				);

				await open(component);
				await prev(component);

				const
					windowTopOffset = await getAbsoluteComponentWindowOffset(component);

				expect(windowTopOffset).toBe(0);
			});

			it('moves the window to the previous step', async () => {
				const [component] = await initBottomSlide(
					{
						heightMode: 'full',
						steps
					}
				);

				await open(component);
				await next(component);
				await prev(component);

				const
					windowTopOffset = await getAbsoluteComponentWindowOffset(component),
					step1Absolute = await getAbsolutePageHeight(steps[0]);

				expect(windowTopOffset).toBe(step1Absolute);
			});

			it('does nothing if the window is fully closed', async () => {
				const [component] = await initBottomSlide(
					{
						heightMode: 'full',
						steps
					}
				);

				await prev(component);

				const
					windowTopOffset = await getAbsoluteComponentWindowOffset(component);

				expect(windowTopOffset).toBe(0);
			});
		});

		describe('`recalculateState`', () => {
			it('recalculates the window geometry', async () => {
				const
					contentHeight = 40;

				await page.addStyleTag({
					content: `#test-div {height: ${contentHeight}px;} .test-div {height: ${contentHeight}px}`
				});

				const [component] = await initBottomSlide({
					heightMode: 'content'
				});

				await open(component);

				await component.evaluate(() => {
					const
						el = document.getElementById('test-div'),
						newEl = document.createElement('div');

					newEl.classList.add('test-div');
					el.insertAdjacentElement('afterend', newEl);
				});

				await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 200});

				const
					windowTopOffset = await getAbsoluteComponentWindowOffset(component);

				expect(windowTopOffset).toBe(contentHeight * 2);
			});
		});
	});
};
