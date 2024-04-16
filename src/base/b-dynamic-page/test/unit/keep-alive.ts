import type { JSHandle, Page } from 'playwright';
import type bDynamicPage from 'base/b-dynamic-page/b-dynamic-page';
import test from 'tests/config/unit/test';
import { Component } from 'tests/helpers';

test.describe('<b-dynamic-page> providing `keep-alive`', () => {
	test.beforeEach(({demoPage}) => demoPage.goto());

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

	test('saves and applies horizontal scroll to the children page element', async ({page}) => {
		const
			scrollLeft = 200,
			target = await renderDynamicPage(page, {keepAlive: true});

		await target.evaluate((ctx) => ctx.router?.push('page1'));

		const scroll = await page.getByTestId('horizontalScroll');
		await scroll.evaluate((el, [scrollLeft]) => el.scrollTo({left: scrollLeft}), [scrollLeft]);

		await target.evaluate((ctx) => ctx.router?.push('page2'));

		await test.expect(scroll.isHidden()).resolves.toBe(true);

		await target.evaluate((ctx) => ctx.router?.push('page1'));

		await test.expect(scroll.evaluate(scrollAfterRequestAnimationFrame)).resolves.toBe(scrollLeft);

		function scrollAfterRequestAnimationFrame(el: Element): Promise<number> {
			return new Promise((resolve) => {
				requestAnimationFrame(() => resolve(el.scrollLeft));
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
