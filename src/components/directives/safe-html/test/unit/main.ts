/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { DOMPurifyI } from 'dompurify';

import type { JSHandle, Locator, Page } from 'playwright';
import test from 'tests/config/unit/test';

import type { SafeHtmlDirectiveParams } from 'components/directives/safe-html/interface';

import { Component, Utils } from 'tests/helpers';

test.describe('components/directives/safe-html', () => {
	test.beforeEach(({demoPage}) => demoPage.goto());

	test('should insert sanitized html with default strategy', async ({page}) => {
		const dangerousString = '<div>HTML</div><img src="some/src" onerror=alert(1)><math></math>';
		const safeString = '<div>HTML</div><img src="some/src">';

		const component = await createComponent(page, dangerousString);

		await test.expect(component.innerHTML()).toBeResolvedTo(safeString);
	});

	test.describe('strategies', () => {
		['v2', 'v3'].forEach((version) => {
			test.describe(`dompurify ${version}`, () => {
				test('should insert sanitized html', async ({page}) => {
					const dangerousString = '<div>HTML</div><img src="some/src" onerror=alert(1)><math></math>';
					const safeString = '<div>HTML</div><img src="some/src">';

					const strategy = await getDomPurifyByVersion(page, version);

					const component = await createComponent(page, {
						value: dangerousString,
						use: strategy
					});

					await test.expect(component.innerHTML()).toBeResolvedTo(safeString);
				});

				test('should insert sanitized html that satisfies options', async ({page}) => {
					const dangerousString = '<div>HTML</div><img src="some/src" onerror=alert(1)><svg><rect height="50"></rect></svg>';
					const safeString = '<div>HTML</div><img src="some/src"><svg><rect height="50"></rect></svg>';

					const strategy = await getDomPurifyByVersion(page, version);

					const component = await createComponent(page, {
						value: dangerousString,
						use: strategy,

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
		});
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

async function getDomPurifyByVersion(page: Page, version: string) {
	const domPurifyHandler: JSHandle<DOMPurifyI> = await Utils.import(page, `./node_modules/dompurify-${version}/dist/purify.js`);
	return domPurifyHandler.evaluate((ctx) => ctx);
}
