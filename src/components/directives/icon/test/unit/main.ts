/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page, Locator } from 'playwright';

import { BOM } from 'tests/helpers';

import test from 'tests/config/unit/test';

test.describe('<div v-icon>', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('passing the icon name as a static argument', async ({page}) => {
		const directive = await renderDirective(page, {
			'v-icon:foo': null
		});

		test.expect(await directive.innerHTML()).toBe('<svg><use xlink:href="#foo"></use></svg>');
	});

	test('passing the icon name as a dynamic argument', async ({page}) => {
		const directive = await renderDirective(page, {
			'v-icon': 'foo'
		});

		test.expect(await directive.innerHTML()).toBe('<svg><use xlink:href="#foo"></use></svg>');
	});

	async function renderDirective(page: Page, attrs: RenderComponentsVnodeParams['attrs'] = {}): Promise<Locator> {
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
