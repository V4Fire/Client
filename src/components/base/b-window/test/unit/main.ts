/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';

import type bWindow from 'components/base/b-window/b-window';
import { renderWindow, getComponentElementSelector } from 'components/base/b-window/test/helpers';

import test from 'tests/config/unit/test';

test.describe('<b-window>', () => {
	const bWindowOpenedClass = 'b-window_opened_true';

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

		const selector = await getComponentElementSelector(target, 'window');

		// Check that #test-div is inside the b-window
		test.expect(await page.locator(`${selector} #test-div`).textContent())
			.toEqual('Hello content');
	});

	test('should be closed by default', async ({page}) => {
		const target = await renderWindow(page);

		test.expect(await getClassList(target)).not.toContain(bWindowOpenedClass);
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

			test.expect(await getClassList(target)).toContain(bWindowOpenedClass);

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

			test.expect(await getClassList(target)).toContain(bWindowOpenedClass);
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

			const selector = await getComponentElementSelector(target, 'wrapper');
			await page.click(selector, {position: {x: 10, y: 10}});

			test.expect(await getClassList(target)).not.toContain(bWindowOpenedClass);
		});

		test('window should close when `escape` is pressed', async ({page}) => {
			const target = await renderWindow(page);

			await target.evaluate((ctx) => ctx.open());

			const selector = await getComponentElementSelector(target, 'window');
			await page.press(selector, 'Escape');

			test.expect(await getClassList(target)).not.toContain(bWindowOpenedClass);
		});

		test('window should close when `close` is invoked', async ({page}) => {
			const target = await renderWindow(page);

			await target.evaluate((ctx) => ctx.open());
			await target.evaluate((ctx) => ctx.close());

			test.expect(await getClassList(target)).not.toContain(bWindowOpenedClass);

			test.expect(await target.evaluate((ctx) => ctx.getRootMod('opened')))
				.toBe('false');
		});

		test('window should close when `toggle` is invoked', async ({page}) => {
			const target = await renderWindow(page);

			await target.evaluate((ctx) => ctx.open());
			await target.evaluate((ctx) => ctx.toggle());

			test.expect(await getClassList(target)).not.toContain(bWindowOpenedClass);
		});
	});

	/**
	 * Returns component's class list
	 * @param target
	 */
	async function getClassList(target: JSHandle<bWindow>): Promise<string[] | undefined> {
		return target.evaluate((ctx) => ctx.$el?.className.split(' '));
	}
});
