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

	test('should save and apply scroll to the cached page element for the children', async ({page}) => {
		const
			scrollOptions = {left: 200, top: 200},
			target = await renderDynamicPage(page, {keepAlive: true});

		await target.evaluate((ctx) => ctx.router?.push('page1'));

		const scroll = await page.getByTestId('scrollable');
		await scroll.evaluate((el, [{top, left}]) => el.scrollTo({top, left}), [scrollOptions]);

		await target.evaluate((ctx) => ctx.router?.push('page2'));

		await test.expect(scroll).toBeHidden();

		await target.evaluate((ctx) => ctx.router?.push('page1'));

		await test.expect(scroll.evaluate(scrollAfterRequestAnimationFrame)).resolves.toEqual(scrollOptions);

		function scrollAfterRequestAnimationFrame(el: Element): Promise<{top: number; left: number}> {
			return new Promise((resolve) => {
				requestAnimationFrame(() => resolve({top: el.scrollTop, left: el.scrollLeft}));
			});
		}
	});
});
