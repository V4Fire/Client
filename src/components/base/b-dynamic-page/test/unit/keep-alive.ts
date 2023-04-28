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

		await test.expect(target.evaluate(switcher)).resolves.toEqual([
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

	test([
		'should switch pages, providing `keepAliveSize`',
		'it means how many last opened pages will be cached'
	].join(' '), async ({page}) => {
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

	test.describe([
		'`include`',
		'includes specified pages in `keepAlive` caching. When props is empty all loaded pages will be cached'
	].join(' '), () => {
		test('should `include` the component by a string name', async ({page}) => {
			const target = await renderDynamicPage(page, {
				keepAlive: true,
				include: Pages.DYNAMIC_1
			});

			await test.expect(target.evaluate(switcher)).resolves.toEqual([
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

			await test.expect(target.evaluate(switcher)).resolves.toEqual([
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

			await test.expect(target.evaluate(switcher)).resolves.toEqual([
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

			await test.expect(target.evaluate(switcher)).resolves.toEqual([
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

		test('should not `include` components when function-matcher returns `null`', async ({page}) => {
			const target = await renderDynamicPage(page, {
				keepAlive: true,
				include: () => null
			});

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

		test('should not `include` components when function-matcher returns `false`', async ({page}) => {
			const target = await renderDynamicPage(page, {
				keepAlive: true,
				include: () => false
			});

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

		test('should `include` all components, when function-matcher returns `true`', async ({page}) => {
			const target = await renderDynamicPage(page, {
				keepAlive: true,
				include: () => true
			});

			await test.expect(target.evaluate(switcher)).resolves.toEqual([
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

		test('should `include` components whose name matches returned from the function-matcher', async ({page}) => {
			const target = await renderDynamicPage(page, {
				keepAlive: true,
				include: (page) => page
			});

			await test.expect(target.evaluate(switcher)).resolves.toEqual([
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

		test('should `include` components that match the caching strategy defined in the function', async ({page}) => {
			const include = (page, route, ctx) => ({
				cacheKey: page,
				cacheGroup: page,
				createCache: () => ctx.keepAliveCache.global
			});

			const target = await renderDynamicPage(page, {
				keepAlive: true,
				include
			});

			await test.expect(target.evaluate(switcher)).resolves.toEqual([
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

	test.describe([
		'`exclude`',
		'excludes specified pages from `keepAlive` caching'
	].join(' '), () => {
		test('should `exclude` the component by a string name', async ({page}) => {
			const target = await renderDynamicPage(page, {
				keepAlive: true,
				exclude: Pages.DYNAMIC_1
			});

			await test.expect(target.evaluate(switcher)).resolves.toEqual([
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

		test('should `exclude` the components from an array of string names', async ({page}) => {
			const target = await renderDynamicPage(page, {
				keepAlive: true,
				exclude: [Pages.DYNAMIC_1, Pages.DYNAMIC_2]
			});

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

		test('should `exclude` the components by a regular expression', async ({page}) => {
			const target = await renderDynamicPage(page, {
				keepAlive: true,
				exclude: /^p-v4-dynamic-page/
			});

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

		test('should `exclude` components when function-matcher returns `true`', async ({page}) => {
			const target = await renderDynamicPage(page, {
				keepAlive: true,
				exclude: () => true
			});

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

		test('should not `exclude` components when function-matcher returns `false`', async ({page}) => {
			const target = await renderDynamicPage(page, {
				keepAlive: true,
				exclude: () => false
			});

			await test.expect(target.evaluate(switcher)).resolves.toEqual([
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

			await test.expect(target.evaluate(switcher)).resolves.toEqual([
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
