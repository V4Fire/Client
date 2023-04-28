/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import type iDynamicPage from 'components/super/i-dynamic-page/i-dynamic-page';

import {

	renderDynamicPage,
	switcher,
	Pages,
	Hooks,
	prevHookDebugString

} from 'components/base/b-dynamic-page/test/helpers';

test.describe('<b-dynamic-page> providing `keep-alive`', () => {
	test.beforeEach(async ({demoPage}) => {
    await demoPage.goto();
  });

	test('should switch pages and keep them alive', async ({page}) => {
		const target = await renderDynamicPage(page, {
			keepAlive: true
		});

		test.expect(await target.evaluate(switcher)).toEqual([
			Pages.DYNAMIC_1,
			Hooks.ACTIVATED,

			Pages.DYNAMIC_2,
			Hooks.ACTIVATED,
			prevHookDebugString(Hooks.DEACTIVATED),

			Pages.DYNAMIC_1,
			Hooks.ACTIVATED,
			prevHookDebugString(Hooks.DEACTIVATED)
		]);
	});

	test('should switch pages, providing `keepAliveSize`', async ({page}) => {
		const target = await renderDynamicPage(page, {
			keepAlive: true,
			keepAliveSize: 1
		});

		await test.expect(
			target.evaluate(async (ctx) => {
				const res: string[] = [];

				await ctx.router!.push('page3');

				const cur: iDynamicPage = await ctx.component;
				const prev: iDynamicPage = cur;

				res.push(cur.componentName);
				res.push(cur.hook);

				await ctx.router!.push('page1');
				await ctx.router!.push('page2');

				res.push(prev.componentName);
				res.push(prev.hook);

				return res;
			})
		).resolves.toEqual([
			Pages.DYNAMIC_3,
			Hooks.ACTIVATED,

			Pages.DYNAMIC_3,
			Hooks.DESTROYED
		]);
	});

	test.describe('`include`', () => {
		test('should `include` the component by a string name', async ({page}) => {
			const target = await renderDynamicPage(page, {
				keepAlive: true,
				include: Pages.DYNAMIC_1
			});

			test.expect(await target.evaluate(switcher)).toEqual([
				Pages.DYNAMIC_1,
				Hooks.ACTIVATED,

				Pages.DYNAMIC_2,
				Hooks.MOUNTED,
				prevHookDebugString(Hooks.DEACTIVATED),

				Pages.DYNAMIC_1,
				Hooks.ACTIVATED,
				prevHookDebugString(Hooks.DESTROYED)
			]);
		});

		test('should `include` the components from an array of string names', async ({page}) => {
			const target = await renderDynamicPage(page, {
				keepAlive: true,
				include: [Pages.DYNAMIC_1, Pages.DYNAMIC_2]
			});

			test.expect(await target.evaluate(switcher)).toEqual([
				Pages.DYNAMIC_1,
				Hooks.ACTIVATED,

				Pages.DYNAMIC_2,
				Hooks.ACTIVATED,
				prevHookDebugString(Hooks.DEACTIVATED),

				Pages.DYNAMIC_1,
				Hooks.ACTIVATED,
				prevHookDebugString(Hooks.DEACTIVATED)
			]);
		});

		test('should not `include` components not from an array of string names', async ({page}) => {
			const target = await renderDynamicPage(page, {
				keepAlive: true,
				include: [Pages.DYNAMIC_1, Pages.DYNAMIC_3]
			});

			test.expect(await target.evaluate(switcher)).toEqual([
				Pages.DYNAMIC_1,
				Hooks.ACTIVATED,

				Pages.DYNAMIC_2,
				Hooks.MOUNTED,
				prevHookDebugString(Hooks.DEACTIVATED),

				Pages.DYNAMIC_1,
				Hooks.ACTIVATED,
				prevHookDebugString(Hooks.DESTROYED)
			]);
		});

		test('should `include` the components by a regular expression', async ({page}) => {
			const target = await renderDynamicPage(page, {
				keepAlive: true,
				include: /^p-v4-dynamic-page/
			});

			test.expect(await target.evaluate(switcher)).toEqual([
				Pages.DYNAMIC_1,
				Hooks.ACTIVATED,

				Pages.DYNAMIC_2,
				Hooks.ACTIVATED,
				prevHookDebugString(Hooks.DEACTIVATED),

				Pages.DYNAMIC_1,
				Hooks.ACTIVATED,
				prevHookDebugString(Hooks.DEACTIVATED)
			]);
		});

		test('should not `include` any components, because function-matcher always returns `null`', async ({page}) => {
			const target = await renderDynamicPage(page, {
				keepAlive: true,
				include: () => null
			});

			test.expect(await target.evaluate(switcher)).toEqual([
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

		test('should not `include` any components, because function-matcher always returns `false`', async ({page}) => {
			const target = await renderDynamicPage(page, {
				keepAlive: true,
				include: () => false
			});

			test.expect(await target.evaluate(switcher)).toEqual([
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

		test('should `include` all components, because function-matcher always returns `true`', async ({page}) => {
			const target = await renderDynamicPage(page, {
				keepAlive: true,
				include: () => true
			});

			test.expect(await target.evaluate(switcher)).toEqual([
				Pages.DYNAMIC_1,
				Hooks.ACTIVATED,

				Pages.DYNAMIC_2,
				Hooks.ACTIVATED,
				prevHookDebugString(Hooks.DEACTIVATED),

				Pages.DYNAMIC_1,
				Hooks.ACTIVATED,
				prevHookDebugString(Hooks.DEACTIVATED)
			]);
		});

		test('should `include` components, that same as function-matcher`s returns string', async ({page}) => {
			const target = await renderDynamicPage(page, {
				keepAlive: true,
				include: (page) => page
			});

			test.expect(await target.evaluate(switcher)).toEqual([
				Pages.DYNAMIC_1,
				Hooks.ACTIVATED,

				Pages.DYNAMIC_2,
				Hooks.ACTIVATED,
				prevHookDebugString(Hooks.DEACTIVATED),

				Pages.DYNAMIC_1,
				Hooks.ACTIVATED,
				prevHookDebugString(Hooks.DEACTIVATED)
			]);
		});

		test('should `include` components, defined as a function that returns the cache strategy', async ({page}) => {
			const include = (page, route, ctx) => ({
				cacheKey: page,
				cacheGroup: page,
				createCache: () => ctx.keepAliveCache.global
			});

			const target = await renderDynamicPage(page, {
				keepAlive: true,
				include
			});

			test.expect(await target.evaluate(switcher)).toEqual([
				Pages.DYNAMIC_1,
				Hooks.ACTIVATED,

				Pages.DYNAMIC_2,
				Hooks.ACTIVATED,
				prevHookDebugString(Hooks.DEACTIVATED),

				Pages.DYNAMIC_1,
				Hooks.ACTIVATED,
				prevHookDebugString(Hooks.DEACTIVATED)
			]);
		});
	});

	test.describe('`exclude`', () => {
		test('should `exclude` the component by a string name', async ({page}) => {
			const target = await renderDynamicPage(page, {
				keepAlive: true,
				exclude: Pages.DYNAMIC_1
			});

			test.expect(await target.evaluate(switcher)).toEqual([
				Pages.DYNAMIC_1,
				Hooks.MOUNTED,

				Pages.DYNAMIC_2,
				Hooks.ACTIVATED,
				prevHookDebugString(Hooks.DESTROYED),

				Pages.DYNAMIC_1,
				Hooks.MOUNTED,
				prevHookDebugString(Hooks.DEACTIVATED)
			]);
		});

		test('should `exclude` the components by an array of string names', async ({page}) => {
			const target = await renderDynamicPage(page, {
				keepAlive: true,
				exclude: [Pages.DYNAMIC_1, Pages.DYNAMIC_2]
			});

			test.expect(await target.evaluate(switcher)).toEqual([
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

		test('should `exclude` the components by a regular expression', async ({page}) => {
			const target = await renderDynamicPage(page, {
				keepAlive: true,
				exclude: /^p-v4-dynamic-page/
			});

			test.expect(await target.evaluate(switcher)).toEqual([
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

		test('should `exclude` all components, because function-matcher always returns `true`', async ({page}) => {
			const target = await renderDynamicPage(page, {
				keepAlive: true,
				exclude: () => true
			});

			test.expect(await target.evaluate(switcher)).toEqual([
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

		test('should not `exclude` any components, because function-matcher always returns `false`', async ({page}) => {
			const target = await renderDynamicPage(page, {
				keepAlive: true,
				exclude: () => false
			});

			test.expect(await target.evaluate(switcher)).toEqual([
				Pages.DYNAMIC_1,
				Hooks.ACTIVATED,

				Pages.DYNAMIC_2,
				Hooks.ACTIVATED,
				prevHookDebugString(Hooks.DEACTIVATED),

				Pages.DYNAMIC_1,
				Hooks.ACTIVATED,
				prevHookDebugString(Hooks.DEACTIVATED)
			]);
		});
	});

	test.describe('`include` and `exclude`', () => {
		test('should `include` components, defined as a regular expression and `exclude` string-defined component', async ({page}) => {
			const target = await renderDynamicPage(page, {
				keepAlive: true,
				include: /p-v4-dynamic-page/,
				exclude: Pages.DYNAMIC_1
			});

			test.expect(await target.evaluate(switcher)).toEqual([
				Pages.DYNAMIC_1,
				Hooks.MOUNTED,

				Pages.DYNAMIC_2,
				Hooks.ACTIVATED,
				prevHookDebugString(Hooks.DESTROYED),

				Pages.DYNAMIC_1,
				Hooks.MOUNTED,
				prevHookDebugString(Hooks.DEACTIVATED)
			]);
		});
	});
});
