/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable max-lines-per-function */

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
			it('on method call', async () => {
				await render();
				await sidebar.evaluate((ctx) => ctx.open());
				await h.bom.waitForIdleCallback(page);

				const classList = await sidebar.evaluate((ctx) => ctx.$el.className.split(' '));
				expect(classList).toContain('b-sidebar_opened_true');
			});
		});

		describe('close', () => {
			it('on overlay click', async () => {
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

			it('on esp press', async () => {
				await render();
				await sidebar.evaluate((ctx) => ctx.open());
				await h.bom.waitForIdleCallback(page);
				await page.press('.b-sidebar', 'Escape');
				await h.bom.waitForIdleCallback(page);
				const classList = await sidebar.evaluate((ctx) => ctx.$el.className.split(' '));
				expect(classList).not.toContain('b-sidebar_opened_true');
			});

			it('on close method call', async () => {
				await render();
				await sidebar.evaluate((ctx) => ctx.open());
				await h.bom.waitForIdleCallback(page);
				await sidebar.evaluate((ctx) => ctx.close());
				await h.bom.waitForIdleCallback(page);
				const classList = await sidebar.evaluate((ctx) => ctx.$el.className.split(' '));
				expect(classList).not.toContain('b-sidebar_opened_true');
			});
		});
	});
};
