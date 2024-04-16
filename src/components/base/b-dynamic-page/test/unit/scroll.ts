/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import { renderDynamicPage } from 'components/base/b-dynamic-page/test/helpers';

test.describe('<b-dynamic-page> scroll', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('saves and applies a horizontal scroll to the children cached page element', async ({page}) => {
		const
			scrollLeft = 200,
			target = await renderDynamicPage(page, {keepAlive: true});

		await target.evaluate((ctx) => ctx.router?.push('page1'));

		const scroll = await page.getByTestId('horizontalScroll');
		await scroll.evaluate((el, [scrollLeft]) => el.scrollTo({left: scrollLeft}), [scrollLeft]);

		await target.evaluate((ctx) => ctx.router?.push('page2'));

		await test.expect(scroll.isHidden()).resolves.toBe(true);

		await target.evaluate((ctx) => ctx.router?.push('page1'));

		await test.expect(scroll.evaluate(scrollAfterRequestAnimationFrame)).resolves.toBe(scrollLeft);

		function scrollAfterRequestAnimationFrame(el: Element): Promise<number> {
			return new Promise((resolve) => {
				requestAnimationFrame(() => resolve(el.scrollLeft));
			});
		}
	});
});
