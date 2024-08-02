/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';
import type bDynamicPage from 'base/b-dynamic-page/b-dynamic-page';
import test from 'tests/config/unit/test';
import { Component } from 'tests/helpers';

test.describe('<b-dynamic-page>', () => {
	test.beforeEach(({demoPage}) => demoPage.goto());

	test('should reuse the page component instance when not using different keys for page components', async ({page}) => {
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

	test('should create a new page component when using different keys for page components', async ({page}) => {
		const target = await renderDynamicPage(
			page,
			{
				keepAlive: true,
				eventConverter: (route) => ([route?.meta?.component ?? null, Object.fastHash(route?.params)]),
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

/**
 * Creates the `bRouter`, renders the `bDynamicPage` component and returns Promise<JSHandle>
 *
 * @param page
 * @param attrs
 * @param routesConfig
 */
export async function renderDynamicPage(
	page: Page,
	attrs: RenderComponentsVnodeParams['attrs'] = {},
	routesConfig?: Dictionary
): Promise<JSHandle<bDynamicPage>> {
	await Component.createComponent(page, 'b-router', {
		attrs: {
			routes: routesConfig ?? {
				page1: {
					path: '/page-1',
					component: 'p-v4-dynamic-page1'
				},

				page2: {
					path: '/page-2',
					component: 'p-v4-dynamic-page2'
				}
			}
		}
	});

	return Object.cast(Component.createComponent(page, 'b-dynamic-page', {
		attrs: {
			id: 'target',
			...attrs
		}
	}));
}
