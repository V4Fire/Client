/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page, JSHandle } from 'playwright';

import test from 'tests/config/unit/test';
import Component from 'tests/helpers/component';

import type bList from 'components/base/b-list/b-list';
import { createListSelector } from 'components/base/b-list/test/helpers';

test.describe('<b-list> links', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('should change location after click on the item with `href`', async ({page}) => {
		await renderList(page, {
			items: [
				{
					label: 'Foo',
					href: '#foo'
				},

				{
					label: 'Bla',
					href: '#bla'
				}
			]
		});

		const
			itemSelector = createListSelector('item'),
			linkSelector = createListSelector('link'),
			selector = `${itemSelector}:nth-child(2) ${linkSelector}`;

		await page.click(selector);

		test.expect(await page.evaluate(() => location.hash)).toBe('#bla');
	});

	test('should generate links from items values with `autoHref = true`', async ({page}) => {
		await renderList(page, {
			autoHref: true,

			items: [
				{
					label: 'Foo',
					value: '#foo'
				},

				{
					label: 'Bla',
					value: '#bla'
				}
			]
		});

		const
			itemSelector = createListSelector('item'),
			linkSelector = createListSelector('link'),
			selector = `${itemSelector}:nth-child(1) ${linkSelector}`;

		await page.click(selector);

		test.expect(await page.evaluate(() => location.hash)).toBe('#foo');
	});

	/**
	 * Returns the rendered `b-list` component
	 *
	 * @param page
	 * @param attrs
	 */
	async function renderList(page: Page, attrs: RenderComponentsVnodeParams['attrs'] = {}): Promise<JSHandle<bList>> {
		await Component.createComponent(page, 'b-list', [
			{
				attrs: {
					id: 'target',
					...attrs
				}
			}
		]);

		return Component.waitForComponentByQuery(page, '#target');
	}
});
