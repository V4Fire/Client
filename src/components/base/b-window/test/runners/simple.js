// @ts-check

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

/** @param {Page} page */
module.exports = (page) => {
	describe('b-window simple tests', () => {
		beforeEach(async () => {
			await page.evaluate(() => globalThis.removeCreatedComponents());
		});

		it('renders the specified content', async () => {
			await init();
			const div = await h.dom.waitForEl(page, '#test-div');
			expect(await div.evaluate((ctx) => ctx.textContent)).toBe('Hello content');
		});

		it('closed by default', async () => {
			const
				target = await init(),
				classList = await target.evaluate((ctx) => ctx.$el.className.split(' '));

			expect(classList).not.toContain('b-window_opened_true');
		});

		describe('open', () => {
			it('emits an event if opening', async () => {
				const
					target = await init(),
					subscribe = target.evaluate((ctx) => new Promise((res) => ctx.once('open', res)));

				await target.evaluate((ctx) => ctx.open());
				await expectAsync(subscribe).toBeResolved();
			});

			it('shows the window when `open` is invoked', async () => {
				const target = await init();
				await target.evaluate((ctx) => ctx.open());

				const classList = await target.evaluate((ctx) => ctx.$el.className.split(' '));
				expect(classList).toContain('b-window_opened_true');

				expect(await target.evaluate((ctx) => ctx.getRootMod('opened')))
					.toBe('true');
			});

			it('switching to a different stage via `open`', async () => {
				const target = await init();
				await target.evaluate((ctx) => ctx.open('foo'));

				expect(await target.evaluate((ctx) => ctx.stage)).toBe('foo');
			});

			it('shows the window when `toggle` is invoked', async () => {
				const target = await init();
				await target.evaluate((ctx) => ctx.toggle());

				const classList = await target.evaluate((ctx) => ctx.$el.className.split(' '));
				expect(classList).toContain('b-window_opened_true');
			});
		});

		describe('close', () => {
			it('emits an event if closing', async () => {
				const target = await init();
				await target.evaluate((ctx) => ctx.open());

				const subscribe = target.evaluate((ctx) => new Promise((res) => ctx.once('close', res)));
				await target.evaluate((ctx) => ctx.close());

				await expectAsync(subscribe).toBeResolved();
			});

			it('closes the window by a click', async () => {
				const
					target = await init();

				await target.evaluate((ctx) => ctx.open());
				await page.click('.b-window__wrapper', {position: {x: 10, y: 10}});

				const classList = await target.evaluate((ctx) => ctx.$el.className.split(' '));
				expect(classList).not.toContain('b-window_opened_true');
			});

			it('closes the window when `escape` is pressed', async () => {
				const
					target = await init();

				await target.evaluate((ctx) => ctx.open());
				await page.press('.b-window', 'Escape');

				const classList = await target.evaluate((ctx) => ctx.$el.className.split(' '));
				expect(classList).not.toContain('b-window_opened_true');
			});

			it('closes the window when `close` is invoked', async () => {
				const target = await init();

				await target.evaluate((ctx) => ctx.open());
				await target.evaluate((ctx) => ctx.close());

				const classList = await target.evaluate((ctx) => ctx.$el.className.split(' '));
				expect(classList).not.toContain('b-window_opened_true');

				expect(await target.evaluate((ctx) => ctx.getRootMod('opened')))
					.toBe('false');
			});

			it('closes the window when `toggle` is invoked', async () => {
				const
					target = await init();

				await target.evaluate((ctx) => ctx.open());
				await target.evaluate((ctx) => ctx.toggle());

				const classList = await target.evaluate((ctx) => ctx.$el.className.split(' '));
				expect(classList).not.toContain('b-window_opened_true');
			});
		});
	});

	async function init(attrs = {}) {
		await page.evaluate((attrs) => {
			globalThis.renderComponents('b-window', [
				{
					content: {
						body: {
							tag: 'div',
							content: 'Hello content',
							attrs: {
								id: 'test-div'
							}
						}
					},

					attrs: {
						id: 'target',
						title: 'Bla',
						...attrs
					}
				}
			]);
		}, attrs);

		return h.component.waitForComponent(page, '#target');
	}
};
