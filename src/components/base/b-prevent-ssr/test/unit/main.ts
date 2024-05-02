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
		const target = await renderComponent(page);

		await target.evaluate(async (ctx) => {
			// @ts-ignore We can't define the `HYDRATION` global value here,
			// so setting the field explicitly to simulate the `onMount` logic
			ctx.field.set('ssrRendering', true);

			await ctx.nextTick();
		});

		await test.expect(page.locator('#test-content')).toHaveText('content');
		await test.expect(page.locator('#test-fallback')).not.toBeVisible();
	});

	test(
		[
			'should render the fallback content, passed to the `fallback` slot',
			'if the `ssrRendering` field is set to `false`'
		].join(' '),

		async ({page}) => {
			await renderComponent(page);

			// The `ssrRendering` is initially set to `false` and should be switched to `true`
			// when the component is mounted, but it works only in a hydration context
			await test.expect(page.locator('#test-content')).not.toBeVisible();
			await test.expect(page.locator('#test-fallback')).toHaveText('fallback');
		}
	);
});

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
