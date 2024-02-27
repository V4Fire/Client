/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Locator, Page } from 'playwright';
import test from 'tests/config/unit/test';

import { Component } from 'tests/helpers';
import type { SafeHtmlDirectiveParams } from 'core/component/directives/safe-html/interface';

test.describe('core/component/directives/safe-html', () => {
	const htmlString = '<p>Some</p><div>string</div><strong>with</strong><strong>HTML</strong>';

	test.beforeEach(({demoPage}) => demoPage.goto());

	test('should insert sanitized html', async ({page}) => {
		const component = await createComponent(page, htmlString);

		await test.expect((await component.innerHTML()).trim()).toEqual(htmlString);
	});

	test('should insert sanitized html with options', async ({page}) => {
		const component = await createComponent(page,
			{
				value: htmlString,
				options: {
					USE_PROFILES: {
						html: true,
						svg: true
					}
				}
			});

		await test.expect((await component.innerHTML()).trim()).toEqual(htmlString);
	});
});

async function createComponent(
	page: Page,
	safeHtml: SafeHtmlDirectiveParams['value']
): Promise<Locator> {
	const componentTestId = 'target';
	await Component.createComponent(page, 'b-dummy', {
		children: {
			default: {
				type: 'div',
				attrs: {
					'data-testid': componentTestId,
					'v-safe-html': safeHtml
				}
			}
		}
	});

	return page.getByTestId(componentTestId);
}
