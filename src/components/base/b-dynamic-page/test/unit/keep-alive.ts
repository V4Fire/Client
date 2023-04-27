/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iDynamicPage from 'components/super/i-dynamic-page/i-dynamic-page';
import test from 'tests/config/unit/test';

import { renderDynamicPage, switcher, Pages, Hooks, prevHookDebugString } from 'components/base/b-dynamic-page/test/helpers';

test.describe('<b-dynamic-page> providing `keep-alive`', () => {
	test.beforeEach(async ({demoPage}) => {
    await demoPage.goto();
  });

	test('should switch pages and keep alive them', async ({page}) => {
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

		test.expect(
			await target.evaluate(async (ctx) => {
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
		).toEqual([
			Pages.DYNAMIC_3,
			Hooks.ACTIVATED,

			Pages.DYNAMIC_3,
			Hooks.DESTROYED
		]);
	});

	test.describe('providing `include`. Include to `keep-alive` components list', () => {
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

		test('should `include` the components by an array of string names', async ({page}) => {
			let target = await renderDynamicPage(page, {
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

			target = await renderDynamicPage(page, {
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
				include: 'return /^p-v4-dynamic-page/'
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

		test('should `include` the components, which name defined as a function that returns `null` or `false`', async ({page}) => {
			const res = [
				Pages.DYNAMIC_1,
				Hooks.MOUNTED,

				Pages.DYNAMIC_2,
				Hooks.MOUNTED,
				prevHookDebugString(Hooks.DESTROYED),

				Pages.DYNAMIC_1,
				Hooks.MOUNTED,
				prevHookDebugString(Hooks.DESTROYED)
			];

			{
				const target = await renderDynamicPage(page, {
					keepAlive: true,
					include: 'return () => null'
				});

				test.expect(await target.evaluate(switcher)).toEqual(res);
			}

			{
				const target = await renderDynamicPage(page, {
					keepAlive: true,
					include: 'return () => false'
				});

				test.expect(await target.evaluate(switcher)).toEqual(res);
			}
		});

		test('should `include` the components, which name defined as a function that returns `true` or a string', async ({page}) => {
			const res = [
				Pages.DYNAMIC_1,
				Hooks.ACTIVATED,

				Pages.DYNAMIC_2,
				Hooks.ACTIVATED,
				prevHookDebugString(Hooks.DEACTIVATED),

				Pages.DYNAMIC_1,
				Hooks.ACTIVATED,
				prevHookDebugString(Hooks.DEACTIVATED)
			];

			{
				const target = await renderDynamicPage(page, {
					keepAlive: true,
					include: 'return () => true'
				});

				test.expect(await target.evaluate(switcher)).toEqual(res);
			}

			{
				const target = await renderDynamicPage(page, {
					keepAlive: true,
					include: 'return (page) => page'
				});

				test.expect(await target.evaluate(switcher)).toEqual(res);
			}
		});

		test('should `include` components, defined as a function that returns the cache strategy', async ({page}) => {
			const include = `
return (page, route, ctx) => ({
cacheKey: page,
cacheGroup: page,
createCache: () => ctx.keepAliveCache.global
})`;

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

	test.describe('providing `exclude`. Exclude from `keep-alive` components list', () => {
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
				exclude: 'return /^p-v4-dynamic-page/'
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

		test('should `exclude` the components, which name defined as a function that returns `true`', async ({page}) => {
			const target = await renderDynamicPage(page, {
				keepAlive: true,
				exclude: 'return () => true'
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

		test('should `exclude` the components, which name defined as a function that returns `false`', async ({page}) => {
			const target = await renderDynamicPage(page, {
				keepAlive: true,
				exclude: 'return () => false'
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

	test.describe('providing support `include` and `exclude` composition', () => {
		test('should `include` components, defined as a regular expression and `exclude` string-defined component', async ({page}) => {
			const target = await renderDynamicPage(page, {
				keepAlive: true,
				include: 'return /p-v4-dynamic-page/',
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
