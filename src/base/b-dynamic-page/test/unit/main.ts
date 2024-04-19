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

test.describe.only('<b-dynamic-page>', () => {
	test.beforeEach(({demoPage}) => demoPage.goto());

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
 */
export async function renderDynamicPage(
	page: Page,
	attrs: RenderComponentsVnodeParams['attrs'] = {}
): Promise<JSHandle<bDynamicPage>> {
	await Component.createComponent(page, 'b-router', {
		attrs: {
			routes: {
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
