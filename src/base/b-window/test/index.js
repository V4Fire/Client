/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @typedef {import('playwright').Page} Page
 */

const
	h = include('tests/helpers');

/**
 * Starts a test
 *
 * @param {Page} page
 * @returns {!Promise<void>}
 */
module.exports = (page) => {
	let
		window;

	const render = async () => {
		await page.evaluate(() => {
			globalThis.renderComponents('b-window', [
				{
					attrs: {},
					content: {
						default: {
							tag: 'div',
							content: 'Hello content',
							attrs: {
								id: 'test-div'
							}
						}
					}
				}
			]);
		});

		window = await h.component.waitForComponent(page, '.b-window');
	};

	describe('b-window', () => {
		beforeEach(async () => {
			await page.evaluate(() => globalThis.removeCreatedComponents());
		});

		it('renders the specified content', async () => {
			await render();
			const div = await h.dom.waitForEl(page, '#test-div');
			expect(await div.evaluate((ctx) => ctx.textContent)).toBe('Hello content');
		});

		it('closed by default', async () => {
			await render();
			await h.bom.waitForIdleCallback(page);

			const classList = await window.evaluate((ctx) => ctx.$el.className.split(' '));
			expect(classList).not.toContain('b-window_opened_true');
		});

		describe('open', () => {
			it('emits an event if opening', async () => {
				await render();
				const subscribe = window.evaluate((ctx) => new Promise((res) => ctx.once('open', res)));
				await window.evaluate((ctx) => ctx.open());
				await h.bom.waitForIdleCallback(page);
				await expectAsync(subscribe).toBeResolved();
			});

			it('shows the window when `open` is invoked', async () => {
				await render();
				await window.evaluate((ctx) => ctx.open());
				await h.bom.waitForIdleCallback(page);

				const classList = await window.evaluate((ctx) => ctx.$el.className.split(' '));
				expect(classList).toContain('b-window_opened_true');
			});

			it('shows the window when `toggle` is invoked', async () => {
				await render();
				await window.evaluate((ctx) => ctx.toggle());
				await h.bom.waitForIdleCallback(page);

				const classList = await window.evaluate((ctx) => ctx.$el.className.split(' '));
				expect(classList).toContain('b-window_opened_true');
			});
		});

		describe('close', () => {
			it('emits an event if closing', async () => {
				await render();
				await window.evaluate((ctx) => ctx.open());
				await h.bom.waitForIdleCallback(page);

				const subscribe = window.evaluate((ctx) => new Promise((res) => ctx.once('close', res)));
				await window.evaluate((ctx) => ctx.close());

				await expectAsync(subscribe).toBeResolved();
			});

			it('closes the window by a click', async () => {
				await render();
				await window.evaluate((ctx) => ctx.open());
				await h.bom.waitForIdleCallback(page);
				await page.click('.b-window__wrapper', {position: {x: 10, y: 10}});
				await h.bom.waitForIdleCallback(page);

				const classList = await window.evaluate((ctx) => ctx.$el.className.split(' '));
				expect(classList).not.toContain('b-window_opened_true');
			});

			it('closes the window when "escape" is pressed', async () => {
				await render();
				await window.evaluate((ctx) => ctx.open());
				await h.bom.waitForIdleCallback(page);
				await page.press('.b-window', 'Escape');
				await h.bom.waitForIdleCallback(page);

				const classList = await window.evaluate((ctx) => ctx.$el.className.split(' '));
				expect(classList).not.toContain('b-window_opened_true');
			});

			it('closes the window when `close` is invoked', async () => {
				await render();
				await window.evaluate((ctx) => ctx.open());
				await h.bom.waitForIdleCallback(page);
				await window.evaluate((ctx) => ctx.close());
				await h.bom.waitForIdleCallback(page);

				const classList = await window.evaluate((ctx) => ctx.$el.className.split(' '));
				expect(classList).not.toContain('b-window_opened_true');
			});

			it('closes the window when `toggle` is invoked', async () => {
				await render();
				await window.evaluate((ctx) => ctx.open());
				await h.bom.waitForIdleCallback(page);
				await window.evaluate((ctx) => ctx.toggle());
				await h.bom.waitForIdleCallback(page);

				const classList = await window.evaluate((ctx) => ctx.$el.className.split(' '));
				expect(classList).not.toContain('b-window_opened_true');
			});
		});
	});
};
