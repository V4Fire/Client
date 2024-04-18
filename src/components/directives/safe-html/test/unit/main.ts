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

	const options = {
		USE_PROFILES: {
			html: true,
			svg: true
		}
	};

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
			options
		});

		await test.expect(component.innerHTML()).toBeResolvedTo(safeString);
	});

	[
		{
			title: 'with options',
			withOptions: true
		},
		{
			title: 'with a raw value',
			withOptions: false
		}
	].forEach(({title, withOptions}) => {
		test.describe(title, () => {
			test('should correctly insert a non-nullish primitive value', async ({page}) => {
				const primitiveValue = 123;
				const safeString = '123';

				const component = await createComponent(
					page,

					withOptions ?

						{
							value: primitiveValue,
							options
						} :

						primitiveValue
				);

				await test.expect(component.innerHTML()).toBeResolvedTo(safeString);
			});

			test('should insert an empty string for the nullish value', async ({page}) => {
				const component = await createComponent(
					page,

					withOptions ?

						{
							value: null,
							options
						} :

						null
				);

				await test.expect(component.innerHTML()).toBeResolvedTo('');
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
