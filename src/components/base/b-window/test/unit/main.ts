/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { renderWindow } from 'components/base/b-window/test/helpers';

import test from 'tests/config/unit/test';

test.describe('<b-window>', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('should render the specified content', async ({page}) => {
		const target = await renderWindow(page, {
			children: {
				body: {
					type: 'div',
					children: {
						default: 'Hello content'
					},
					attrs: {
						id: 'test-div'
					}
				}
			}
		});

		test
			.expect(
				// QUESTION: can querySelector be used in this context
				await target.evaluate((ctx) => ctx.$el?.querySelector('#test-div')?.textContent)
			)
			.toEqual(
				'Hello content'
			);
	});

	test('should be closed by default', async ({page}) => {
		const
			target = await renderWindow(page),
			classList = await target.evaluate((ctx) => ctx.$el?.className.split(' '));

		test.expect(classList).not.toContain('b-window_opened_true');
	});

	test.describe('`open`', () => {
		test('should emit event on opening', async ({page}) => {
			const
				target = await renderWindow(page),
				subscribe = target.evaluate((ctx) => new Promise((res) => ctx.once('open', res)));

			await target.evaluate((ctx) => ctx.open());
			await test.expect(subscribe).toBeResolved();
		});

		test('window should show when `open` is invoked', async ({page}) => {
			const target = await renderWindow(page);
			await target.evaluate((ctx) => ctx.open());

			const classList = await target.evaluate((ctx) => ctx.$el?.className.split(' '));
			test.expect(classList).toContain('b-window_opened_true');

			test.expect(await target.evaluate((ctx) => ctx.getRootMod('opened')))
				.toBe('true');
		});

		test('should switch to a different stage via `open`', async ({page}) => {
			const target = await renderWindow(page);
			await target.evaluate((ctx) => ctx.open('foo'));

			test.expect(await target.evaluate((ctx) => ctx.stage)).toBe('foo');
		});

		test('window should show when `toggle` is invoked', async ({page}) => {
			const target = await renderWindow(page);
			await target.evaluate((ctx) => ctx.toggle());

			const classList = await target.evaluate((ctx) => ctx.$el?.className.split(' '));
			test.expect(classList).toContain('b-window_opened_true');
		});
	});

	test.describe('`close`', () => {
		test('should emit event on closing', async ({page}) => {
			const target = await renderWindow(page);
			await target.evaluate((ctx) => ctx.open());

			const subscribe = target.evaluate((ctx) => new Promise((res) => ctx.once('close', res)));

			await target.evaluate((ctx) => ctx.close());
			await test.expect(subscribe).toBeResolved();
		});

		test('should close the window by a click', async ({page}) => {
			const target = await renderWindow(page);

			await target.evaluate((ctx) => ctx.open());
			await page.click('.b-window__wrapper', {position: {x: 10, y: 10}});

			const classList = await target.evaluate((ctx) => ctx.$el?.className.split(' '));
			test.expect(classList).not.toContain('b-window_opened_true');
		});

		test('window should close when `escape` is pressed', async ({page}) => {
			const target = await renderWindow(page);

			await target.evaluate((ctx) => ctx.open());
			await page.press('.b-window', 'Escape');

			const classList = await target.evaluate((ctx) => ctx.$el?.className.split(' '));
			test.expect(classList).not.toContain('b-window_opened_true');
		});

		test('window should close when `close` is invoked', async ({page}) => {
			const target = await renderWindow(page);

			await target.evaluate((ctx) => ctx.open());
			await target.evaluate((ctx) => ctx.close());

			const classList = await target.evaluate((ctx) => ctx.$el?.className.split(' '));
			test.expect(classList).not.toContain('b-window_opened_true');

			test.expect(await target.evaluate((ctx) => ctx.getRootMod('opened')))
				.toBe('false');
		});

		test('window should close when `toggle` is invoked', async ({page}) => {
			const target = await renderWindow(page);

			await target.evaluate((ctx) => ctx.open());
			await target.evaluate((ctx) => ctx.toggle());

			const classList = await target.evaluate((ctx) => ctx.$el?.className.split(' '));
			test.expect(classList).not.toContain('b-window_opened_true');
		});
	});
});
