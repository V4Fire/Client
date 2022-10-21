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
	h = include('tests/helpers').default;

/**
 * Starts a test
 *
 * @param {Page} page
 * @returns {!Promise<void>}
 */
module.exports = (page) => {
	let
		sidebar;

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
			const classList = await sidebar.evaluate((ctx) => ctx.$el.className.split(' '));
			expect(classList).not.toContain('b-sidebar_opened_true');
		});

		describe('open', () => {
			it('emits an event if opening', async () => {
				await render();
				const subscribe = sidebar.evaluate((ctx) => new Promise((res) => ctx.once('open', res)));
				await sidebar.evaluate((ctx) => ctx.open());
				await expectAsync(subscribe).toBeResolved();
			});

			it('shows the sidebar when `open` is invoked', async () => {
				await render();
				await sidebar.evaluate((ctx) => ctx.open());

				const classList = await sidebar.evaluate((ctx) => ctx.$el.className.split(' '));
				expect(classList).toContain('b-sidebar_opened_true');
			});

			it('shows the sidebar when `toggle` is invoked', async () => {
				await render();
				await sidebar.evaluate((ctx) => ctx.toggle());

				const classList = await sidebar.evaluate((ctx) => ctx.$el.className.split(' '));
				expect(classList).toContain('b-sidebar_opened_true');
			});
		});

		describe('close', () => {
			it('emits an event if closing', async () => {
				await render();
				await sidebar.evaluate((ctx) => ctx.open());

				const subscribe = sidebar.evaluate((ctx) => new Promise((res) => ctx.once('close', res)));
				await sidebar.evaluate((ctx) => ctx.close());

				await expectAsync(subscribe).toBeResolved();
			});

			it('closes the sidebar by a click', async () => {
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
				await page.click('.b-sidebar__over-wrapper');

				const classList = await sidebar.evaluate((ctx) => ctx.$el.className.split(' '));
				expect(classList).not.toContain('b-sidebar_opened_true');
			});

			it('closes the sidebar when `escape` is pressed', async () => {
				await render();

				await sidebar.evaluate((ctx) => ctx.open());
				await page.press('.b-sidebar', 'Escape');

				const classList = await sidebar.evaluate((ctx) => ctx.$el.className.split(' '));
				expect(classList).not.toContain('b-sidebar_opened_true');
			});

			it('closes the sidebar when `close` is invoked', async () => {
				await render();

				await sidebar.evaluate((ctx) => ctx.open());
				await sidebar.evaluate((ctx) => ctx.close());

				const classList = await sidebar.evaluate((ctx) => ctx.$el.className.split(' '));
				expect(classList).not.toContain('b-sidebar_opened_true');
			});

			it('closes the sidebar when `toggle` is invoked', async () => {
				await render();

				await sidebar.evaluate((ctx) => ctx.open());
				await sidebar.evaluate((ctx) => ctx.toggle());

				const classList = await sidebar.evaluate((ctx) => ctx.$el.className.split(' '));
				expect(classList).not.toContain('b-sidebar_opened_true');
			});
		});
	});

	async function render() {
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
	}
};
