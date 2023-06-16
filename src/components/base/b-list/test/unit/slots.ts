/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import { renderList, createListSelector } from 'components/base/b-list/test/helpers';

test.describe('<b-list> slots', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('should render items using the `default` slot', async ({page}) => {
		await renderList(page, {
			children: {
				default: ({item}) => `Label: ${item.label}`
			}
		});

		const selector = createListSelector('link-value');

		test.expect(await page.locator(selector).allTextContents())
			.toEqual(['Label: Foo', 'Label: Bla']);
	});

	test('should render `icon`, `preIcon`, `progressIcon` slots in the item template', async ({page}) => {
		await renderList(page, {
			children: {
				icon: ({icon}) => icon,
				preIcon: ({icon}) => icon,
				progressIcon: ({icon}) => icon
			},

			attrs: {
				items: [
					{
						label: 'Foo',
						icon: 'foo',
						preIcon: 'foo2',
						progressIcon: 'foo3'
					},

					{
						label: 'Bla',
						icon: 'bla',
						preIcon: 'bla2',
						progressIcon: 'bla3'
					}
				]
			}
		});

		const
			postIconSelector = createListSelector('link-post-icon'),
			preIconSelector = createListSelector('link-pre-icon'),
			progressSelector = createListSelector('link-progress');

		test.expect(await page.locator(postIconSelector).allTextContents())
			.toEqual(['foo', 'bla']);

		test.expect(await page.locator(preIconSelector).allTextContents())
			.toEqual(['foo2', 'bla2']);

		test.expect(await page.locator(progressSelector).allTextContents())
			.toEqual(['foo3', 'bla3']);
	});
});
