/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import {

	renderDynamicPage,

	switcher,
	prevHookDebugString,

	Pages,
	Hooks

} from 'components/base/b-dynamic-page/test/helpers';

test.describe('<b-dynamic-page>', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('should reuse the page component instance if the page does not change and the page key is not specified', async ({page}) => {
		const target = await renderDynamicPage(
			page,
			{
				keepAlive: true,
				include: (_, route) => Object.fastHash(route.params)
			},

			{
				page1: {
					path: '/page-1/:id',
					component: 'p-v4-dynamic-page1'
				}
			}
		);

		const isSamePageComponent = await target.evaluate(async (ctx) => {
			await ctx.router?.push('page1', {params: {id: 1}});
			const page1Component = ctx.unsafe.$refs.component?.[0];

			const routeTransition = ctx.unsafe.async.promisifyOnce(ctx.r, 'transition');
			await ctx.router?.push('page1', {params: {id: 2}});
			await routeTransition;
			const page2Component = ctx.unsafe.$refs.component?.[0];

			return page1Component === page2Component;
		});

		test.expect(isSamePageComponent).toBe(true);
	});

	test('should create a new page component if the page does not change but the page key changes', async ({page}) => {
		const target = await renderDynamicPage(
			page,
			{
				keepAlive: true,
				pageGetter: (route) => ([route?.meta?.component ?? null, Object.fastHash(route?.params)]),
				include: (_, route) => Object.fastHash(route.params)
			},
			{
				page1: {
					path: '/page-1/:id',
					component: 'p-v4-dynamic-page1'
				}
			}
		);

		const isSamePageComponent = await target.evaluate(async (ctx) => {
			await ctx.router?.push('page1', {params: {id: 1}});
			const page1Component = ctx.unsafe.$refs.component?.[0];

			const routeTransition = ctx.unsafe.async.promisifyOnce(ctx.r, 'transition');
			await ctx.router?.push('page1', {params: {id: 2}});
			await routeTransition;
			const page2Component = ctx.unsafe.$refs.component?.[0];

			return page1Component === page2Component;
		});

		test.expect(isSamePageComponent).toBe(false);
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
		).toBeResolvedTo(true);
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

	test('should not render an empty node if the page is `undefined`', async ({page}) => {
		const target = await renderDynamicPage(page, {'data-testid': 'target'});

		await target.evaluate((ctx) => {
			ctx.page = undefined;

			return ctx.$nextTick();
		});

		const componentInnerHtml = await page.getByTestId('target').innerHTML();

		test.expect(componentInnerHtml).toBe('');
	});
});
