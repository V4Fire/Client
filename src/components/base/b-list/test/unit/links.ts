/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page, JSHandle } from 'playwright';

import test from 'tests/config/unit/test';

import DOM from 'tests/helpers/dom';
import Component from 'tests/helpers/component';

import type bList from 'components/base/b-list/b-list';

/** @param {Page} page */
test.describe('<b-list> providing items with hrefs', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('providing a list with hrefs', async ({page}) => {
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
			itemSelector = DOM.elNameSelectorGenerator('b-list', 'item'),
			linkSelector = DOM.elNameSelectorGenerator('b-list', 'link'),
			selector = `${itemSelector}:nth-child(2) ${linkSelector}`;

		await page.click(selector);

		test.expect(await page.evaluate(() => location.hash)).toBe('#bla');
	});

	test('generation of hrefs', async ({page}) => {
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
			itemSelector = DOM.elNameSelectorGenerator('b-list', 'item'),
			linkSelector = DOM.elNameSelectorGenerator('b-list', 'link'),
			selector = `${itemSelector}:nth-child(1) ${linkSelector}`;

		await page.click(selector);

		test.expect(await page.evaluate(() => location.hash)).toBe('#foo');
	});

	/**
	 * Returns a JSHandle to the rendered b-list component
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
