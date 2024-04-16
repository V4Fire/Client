/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import { renderDynamicPage } from 'components/base/b-dynamic-page/test/helpers';

test.describe('<b-dynamic-page> events', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('emits the `beforeRemovePage` event before removing the page element', async ({page}) => {
		const target = await renderDynamicPage(page, {keepAlive: true});

		await target.evaluate((ctx) => {
			globalThis.onBeforeRemovePageCalls = 0;

			ctx.watch('rootEmitter:onBeforeRemovePage', () => {
				globalThis.onBeforeRemovePageCalls++;
			});
		});

		await target.evaluate(async (ctx) => {
			await ctx.router?.push('page1');
			await ctx.router?.push('page2');
		});

		const calls = await target.evaluate(() => globalThis.onBeforeRemovePageCalls);
		test.expect(calls).toBe(1);
	});
});
