/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import { renderDynamicPage } from 'components/base/b-dynamic-page/test/helpers';

test.describe('<b-dynamic-page> standard component events', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('should emit the `beforeSwitchPage` event before removing the page element', async ({page}) => {
		const target = await renderDynamicPage(page, {keepAlive: true});

		const count = await page.evaluateHandle(() => ({value: 0}));

		await target.evaluate((ctx, count) => {
			ctx.watch('rootEmitter:onBeforeSwitchPage', () => {
				count.value++;
			});
		}, count);

		await target.evaluate(async (ctx) => {
			await ctx.router?.push('page1');
			await ctx.router?.push('page2');
		});

		const calls = await count.evaluate(({value}) => value);
		test.expect(calls).toBe(1);
	});
});
