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
		component,
		componentNode;

	describe('`base/b-bottom-slide`', () => {
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
		});

		// afterEach(() => context.close());

		it('by default is hidden', async () => {
			// ...
		});

		describe('`heightMode`', () => {
			describe('`content`', () => {
				it('height calculation is based on the provided content height', async () => {
					await init({
						heightMode: 'content'
					});

					await open();

					const
						windowHeight = await component.evaluate((ctx) => ctx.block.element('content').offsetHeight),
						// @ts-ignore
						contentHeight = await page.$('#test-div').then((el) => el.evaluate((ctx) => ctx.offsetHeight));

					expect(windowHeight).toBe(contentHeight);
				});

				it('if the content height is greater than the screen height - the window size does not exceed the screen height', async () => {
					const
						maxVisiblePercent = 90;

					await init(
						{
							heightMode: 'content',
							maxVisiblePercent
						},
						{
							tag: 'div',
							content: 'hello content',
							attrs: {
								id: 'test-div',
								style: 'height: 3000px;'
							}
						}
					);

					await open();

					const [windowHeight, maxHeight] = await component.evaluate((ctx) => [
						ctx.block.element('content').offsetHeight,
						Math.floor(globalThis.innerHeight / 100 * ctx.maxVisiblePercent)
					]);

					expect(windowHeight).toBe(maxHeight);
				});
			});

			describe('`full`', () => {
				// ...
			});
		});

		async function init(props = {}, content = undefined) {
			content = {
				default: content ?? {
					tag: 'div',
					content: 'Hello content',
					attrs: {
						id: 'test-div'
					}
				}
			};

			await page.evaluate(([props, content]) => {
				globalThis.removeCreatedComponents();

				globalThis.renderComponents('b-bottom-slide', [
					{
						attrs: {
							...props,
							id: 'target'
						},
						content
					}
				]);
			}, [props, content]);

			componentNode = await page.waitForSelector('#target', {state: 'attached'});
			component = await h.component.waitForComponent(page, '#target');

			await h.bom.waitForIdleCallback(page);
		}

		async function open() {
			await component.evaluate((ctx) => ctx.open());
			await h.bom.waitForIdleCallback(page);
		}

	});
};
