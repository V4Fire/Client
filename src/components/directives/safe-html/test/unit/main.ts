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
import type { SafeHtmlDirectiveParams } from 'components/directives/safe-html/interface';

test.describe('components/directives/safe-html', () => {
	test.beforeEach(({demoPage}) => demoPage.goto());

	test('should insert sanitized html', async ({page}) => {
		const dangerousString = '<div>HTML</div><img src="some/src" onerror=alert(1)><math></math>';
		const safeString = '<div>HTML</div><img src="some/src">';

		const component = await createComponent(page, dangerousString);

		await test.expect(component.innerHTML()).toBeResolvedTo(safeString);
	});

	test('should insert sanitized html that satisfies options', async ({page}) => {
		const dangerousString = '<div>HTML</div><img src="some/src" onerror=alert(1)><svg><rect height="50"></rect></svg>';
		const safeString = '<div>HTML</div><img src="some/src"><svg><rect height="50"></rect></svg>';

		const component = await createComponent(page, {
			value: dangerousString,

			options: {
				USE_PROFILES: {
					html: true,
					svg: true
				}
			}
		});

		await test.expect(component.innerHTML()).toBeResolvedTo(safeString);
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
