/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';
import { DOM } from 'tests/helpers';

import { renderSidebar, getClassList, createSidebarSelector } from 'components/base/b-sidebar/test/helpers';

test.describe('<b-sidebar>', () => {
	const
		sidebarOpenedMarkerClass = DOM.elModNameGenerator('b-sidebar', 'opened', 'true');

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('should render the specified content', async ({page}) => {
		await renderSidebar(page);

		// Check that #test-div is inside the b-sidebar
		const selector = `${createSidebarSelector('root-wrapper')} #test-div`;

		await test.expect(page.locator(selector)).toHaveText('Hello content');
	});

	test('should be closed by default', async ({page}) => {
		const sidebar = await renderSidebar(page);

		await test.expect(getClassList(sidebar)).resolves.not.toContain(sidebarOpenedMarkerClass);
	});

	test.describe('`open`', () => {
		test('should emit an event on opening', async ({page}) => {
			const
				sidebar = await renderSidebar(page),
				subscribe = sidebar.evaluate((ctx) => new Promise((res) => ctx.once('open', res)));

			await sidebar.evaluate((ctx) => ctx.open());

			await test.expect(subscribe).toBeResolved();
		});

		test('should show the sidebar when `open` is invoked', async ({page}) => {
			const sidebar = await renderSidebar(page);

			await sidebar.evaluate((ctx) => ctx.open());

			await test.expect(getClassList(sidebar)).resolves.toContain(sidebarOpenedMarkerClass);
		});

		test('should show the sidebar when `toggle` is invoked', async ({page}) => {
			const sidebar = await renderSidebar(page);

			await sidebar.evaluate((ctx) => ctx.toggle());

			await test.expect(getClassList(sidebar)).resolves.toContain(sidebarOpenedMarkerClass);
		});
	});

	test.describe('`close`', () => {
		test('should emit an event on closing', async ({page}) => {
			const
				sidebar = await renderSidebar(page),
				subscribe = sidebar.evaluate((ctx) => new Promise((res) => ctx.once('close', res)));

			await sidebar.evaluate((ctx) => ctx.open());
			await sidebar.evaluate((ctx) => ctx.close());

			await test.expect(subscribe).toBeResolved();
		});

		test('should close the sidebar by a click', async ({page}) => {
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

			const
				sidebar = await renderSidebar(page),
				selector = createSidebarSelector('over-wrapper');

			await sidebar.evaluate((ctx) => ctx.open());
			await page.click(selector);

			await test.expect(getClassList(sidebar)).resolves.not.toContain(sidebarOpenedMarkerClass);
		});

		test('should close the sidebar when `escape` is pressed', async ({page}) => {
			const
				sidebar = await renderSidebar(page);

			await sidebar.evaluate((ctx) => ctx.open());
			await page.press('.b-sidebar', 'Escape');

			await test.expect(getClassList(sidebar)).resolves.not.toContain(sidebarOpenedMarkerClass);
		});

		test('should close the sidebar when `close` is invoked', async ({page}) => {
			const
				sidebar = await renderSidebar(page);

			await sidebar.evaluate((ctx) => ctx.open());
			await sidebar.evaluate((ctx) => ctx.close());

			await test.expect(getClassList(sidebar)).resolves.not.toContain(sidebarOpenedMarkerClass);
		});

		test('should close the sidebar when `toggle` is invoked', async ({page}) => {
			const
				sidebar = await renderSidebar(page);

			await sidebar.evaluate((ctx) => ctx.open());
			await sidebar.evaluate((ctx) => ctx.toggle());

			await test.expect(getClassList(sidebar)).resolves.not.toContain(sidebarOpenedMarkerClass);
		});
	});
});
