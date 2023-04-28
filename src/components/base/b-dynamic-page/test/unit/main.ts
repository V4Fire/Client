/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import { renderDynamicPage, switcher, Pages, Hooks, prevHookDebugString } from 'components/base/b-dynamic-page/test/helpers';

test.describe('<b-dynamic-page>', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test("shouldn't cache the `component` getter", async ({page}) => {
		const target = await renderDynamicPage(page, {
			page: Pages.DYNAMIC_1
		});

		await test.expect(
			target.evaluate((ctx) => {
				const {meta} = ctx.unsafe;
				return 'component' in meta.accessors && !('component' in meta.computedFields);
			})
		).resolves.toBe(true);
	});

	test('fields `page` and `componentName` should be equal', async ({page}) => {
		const target = await renderDynamicPage(page, {
			page: Pages.DYNAMIC_1
		});

		const scan = await target.evaluate(async (ctx) => {
			const res: string[] = [];

			await ctx.nextTick();
			let cur = await ctx.component;
			res.push(ctx.page!, cur.componentName);

			ctx.page = 'p-v4-dynamic-page2';

			await ctx.nextTick();
			cur = await ctx.component;
			res.push(ctx.page, cur.componentName);

			return res;
		});

		test.expect(scan).toEqual([
			Pages.DYNAMIC_1,
			Pages.DYNAMIC_1,

			Pages.DYNAMIC_2,
			Pages.DYNAMIC_2
		]);
	});

	test('should switch pages', async ({page}) => {
		const target = await renderDynamicPage(page);

		await test.expect(target.evaluate(switcher)).resolves.toEqual([
			Pages.DYNAMIC_1,
			Hooks.MOUNTED,

			Pages.DYNAMIC_2,
			Hooks.MOUNTED,
			prevHookDebugString(Hooks.DESTROYED),

			Pages.DYNAMIC_1,
			Hooks.MOUNTED,
			prevHookDebugString(Hooks.DESTROYED)
		]);
	});

});
