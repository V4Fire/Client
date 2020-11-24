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
		sidebar;

	const render = async () => {
		await page.evaluate(() => {
			globalThis.renderComponents('b-sidebar', [
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

		sidebar = await h.component.waitForComponent(page, '.b-sidebar');
	};

	describe('b-sidebar', () => {
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

			const classList = await sidebar.evaluate((ctx) => ctx.$el.className.split(' '));
			expect(classList).not.toContain('b-sidebar_opened_true');
		});

		describe('open', () => {
			it('emits an event of opening', async () => {
				await render();
				const subscribe = sidebar.evaluate((ctx) => new Promise((res) => ctx.once('open', res)));
				await sidebar.evaluate((ctx) => ctx.open());
				await h.bom.waitForIdleCallback(page);
				await expectAsync(subscribe).toBeResolved();
			});

			it('shows the sidebar when `open` is invoked', async () => {
				await render();
				await sidebar.evaluate((ctx) => ctx.open());
				await h.bom.waitForIdleCallback(page);

				const classList = await sidebar.evaluate((ctx) => ctx.$el.className.split(' '));
				expect(classList).toContain('b-sidebar_opened_true');
			});

			it('shows the sidebar when `toggle` is invoked', async () => {
				await render();
				await sidebar.evaluate((ctx) => ctx.toggle());
				await h.bom.waitForIdleCallback(page);

				const classList = await sidebar.evaluate((ctx) => ctx.$el.className.split(' '));
				expect(classList).toContain('b-sidebar_opened_true');
			});
		});

		describe('close', () => {
			it('emits an event of closing', async () => {
				await render();
				await sidebar.evaluate((ctx) => ctx.open());
				await h.bom.waitForIdleCallback(page);

				const subscribe = sidebar.evaluate((ctx) => new Promise((res) => ctx.once('close', res)));
				await sidebar.evaluate((ctx) => ctx.close());

				await expectAsync(subscribe).toBeResolved();
			});

			it('closes the sidebar via a click', async () => {
				await page.evaluate(() => {
					const styles = document.createElement('style');

					styles.innerHTML = `
						.b-sidebar__over-wrapper {
							position: fixed;
							left: 0;
							top: 0;
							height: 100%;
							width: 100%;
						}
					`;

					document.body.appendChild(styles);
				});

				await render();
				await sidebar.evaluate((ctx) => ctx.open());
				await h.bom.waitForIdleCallback(page);
				await page.click('.b-sidebar__over-wrapper');
				await h.bom.waitForIdleCallback(page);

				const classList = await sidebar.evaluate((ctx) => ctx.$el.className.split(' '));
				expect(classList).not.toContain('b-sidebar_opened_true');
			});

			it('closes the sidebar when "escape" is pressed', async () => {
				await render();
				await sidebar.evaluate((ctx) => ctx.open());
				await h.bom.waitForIdleCallback(page);
				await page.press('.b-sidebar', 'Escape');
				await h.bom.waitForIdleCallback(page);
				const classList = await sidebar.evaluate((ctx) => ctx.$el.className.split(' '));
				expect(classList).not.toContain('b-sidebar_opened_true');
			});

			it('closes the sidebar when `close` is invoked', async () => {
				await render();
				await sidebar.evaluate((ctx) => ctx.open());
				await h.bom.waitForIdleCallback(page);
				await sidebar.evaluate((ctx) => ctx.close());
				await h.bom.waitForIdleCallback(page);
				const classList = await sidebar.evaluate((ctx) => ctx.$el.className.split(' '));
				expect(classList).not.toContain('b-sidebar_opened_true');
			});

			it('closes the sidebar when `toggle` is invoked', async () => {
				await render();
				await sidebar.evaluate((ctx) => ctx.open());
				await h.bom.waitForIdleCallback(page);
				await sidebar.evaluate((ctx) => ctx.toggle());
				await h.bom.waitForIdleCallback(page);
				const classList = await sidebar.evaluate((ctx) => ctx.$el.className.split(' '));
				expect(classList).not.toContain('b-sidebar_opened_true');
			});
		});
	});
};
