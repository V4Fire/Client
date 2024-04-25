/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page, JSHandle } from 'playwright';

import test from 'tests/config/unit/test';
import { Component } from 'tests/helpers';

import type bPreventSsr from 'components/base/b-prevent-ssr/b-prevent-ssr';

test.describe('<b-prevent-ssr>', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('should render the content, passed to the default slot after it has been mounted', async ({page}) => {
		await renderComponent(page);

		await test.expect(page.locator('#test-content')).toHaveText('content');
		await test.expect(page.locator('#test-fallback')).not.toBeVisible();
	});

	test(
		[
			'should render the fallback content, passed to the `fallback` slot',
			'if the `preventRendering` field is set to `false`'
		].join(' '),

		async ({page}) => {
			const target = await renderComponent(page);

			await target.evaluate(async (ctx) => {
				// @ts-ignore We can't check immediately after the component has been mounted, so setting it explicitly
				ctx.preventRendering = true;

				await ctx.nextTick();
			});

			await test.expect(page.locator('#test-content')).not.toBeVisible();
			await test.expect(page.locator('#test-fallback')).toHaveText('fallback');
		}
	);
});

/**
 * Renders the `bPreventSsr` component with specified children and returns the `Promise<JSHandle>`
 * @param page
 */
async function renderComponent(page: Page): Promise<JSHandle<bPreventSsr>> {
	return Component.createComponent<bPreventSsr>(page, 'b-prevent-ssr', {
		attrs: {},
		children: {
			default: {
				type: 'div',
				children: {
					default: 'content'
				},
				attrs: {
					id: 'test-content'
				}
			},
			fallback: {
				type: 'div',
				children: {
					default: 'fallback'
				},
				attrs: {
					id: 'test-fallback'
				}
			}
		}
	});
}
