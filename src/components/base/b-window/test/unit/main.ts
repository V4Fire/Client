/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';

import test from 'tests/config/unit/test';
import { DOM } from 'tests/helpers';

import type bWindow from 'components/base/b-window/b-window';
import { renderWindow } from 'components/base/b-window/test/helpers';

test.describe('<b-window>', () => {
	const
		createWindowSelector = DOM.elNameSelectorGenerator('b-window'),
		bWindowOpenedClass = DOM.elModNameGenerator('b-window', 'opened', 'true');

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('should render the specified content', async ({page}) => {
		await renderWindow(page, {
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

		// Check that #test-div is inside the b-window
		const selector = `${createWindowSelector('window')} #test-div`;

		await test.expect(page.locator(selector)).toHaveText('Hello content');
	});

	test('should be closed by default', async ({page}) => {
		const target = await renderWindow(page);

		await test.expect(getClassList(target)).resolves.not.toContain(bWindowOpenedClass);
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

			await test.expect(getClassList(target)).resolves.toContain(bWindowOpenedClass);

			await test.expect(target.evaluate((ctx) => ctx.getRootMod('opened')))
				.toBeResolvedTo('true');
		});

		test('should switch to a different stage via `open`', async ({page}) => {
			const target = await renderWindow(page);
			await target.evaluate((ctx) => ctx.open('foo'));

			await test.expect(target.evaluate((ctx) => ctx.stage)).toBeResolvedTo('foo');
		});

		test('window should show when `toggle` is invoked', async ({page}) => {
			const target = await renderWindow(page);
			await target.evaluate((ctx) => ctx.toggle());

			await test.expect(getClassList(target)).resolves.toContain(bWindowOpenedClass);
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

			await page.click(createWindowSelector('wrapper'), {position: {x: 10, y: 10}});

			await test.expect(getClassList(target)).resolves.not.toContain(bWindowOpenedClass);
		});

		test('window should close when `escape` is pressed', async ({page}) => {
			const target = await renderWindow(page);

			await target.evaluate((ctx) => ctx.open());

			await page.press(createWindowSelector('window'), 'Escape');

			await test.expect(getClassList(target)).resolves.not.toContain(bWindowOpenedClass);
		});

		test('window should close when `close` is invoked', async ({page}) => {
			const target = await renderWindow(page);

			await target.evaluate((ctx) => ctx.open());
			await target.evaluate((ctx) => ctx.close());

			await test.expect(getClassList(target)).resolves.not.toContain(bWindowOpenedClass);

			await test.expect(target.evaluate((ctx) => ctx.getRootMod('opened')))
				.toBeResolvedTo('false');
		});

		test('window should close when `toggle` is invoked', async ({page}) => {
			const target = await renderWindow(page);

			await target.evaluate((ctx) => ctx.open());
			await target.evaluate((ctx) => ctx.toggle());

			await test.expect(getClassList(target)).resolves.not.toContain(bWindowOpenedClass);
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
