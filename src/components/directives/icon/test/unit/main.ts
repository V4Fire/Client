/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page, Locator } from 'playwright';

import test from 'tests/config/unit/test';

import { BOM } from 'tests/helpers';

test.describe('<div v-icon>', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('setting an icon as a static directive argument', async ({page}) => {
		const directive = await renderDirective(page, {
			'v-icon:foo': null
		});

		await page.pause();
		test.expect(await directive.innerHTML()).toBe('<svg><use xlink:href="#foo"></use></svg>');
	});

	test('setting an icon as a dynamic directive value', async ({page}) => {
		const directive = await renderDirective(page, {
			'v-icon': 'foo'
		});

		test.expect(await directive.innerHTML()).toBe('<svg><use xlink:href="#foo"></use></svg>');
	});

	/**
	 * @param page
	 * @param attrs
	 */
	async function renderDirective(page: Page, attrs: Dictionary = {}): Promise<Locator> {
		await page.evaluate((attrs) => {
			globalThis.renderComponents('div', [
				{
					attrs: {
						'data-testid': 'target'
					},

					children: [
						{
							type: 'div',
							attrs
						}
					]
				}
			]);
		}, attrs);

		await BOM.waitForIdleCallback(page);
		return page.getByTestId('target');
	}
});
