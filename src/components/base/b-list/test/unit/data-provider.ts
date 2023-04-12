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
import DOM from 'tests/helpers/dom';

import type bList from 'components/base/b-list/b-list';

import { interceptListRequest } from 'components/base/b-list/test/helpers';

test.describe('<b-list> with data provider', () => {
	test.beforeEach(async ({context, demoPage}) => {
		await interceptListRequest(context);
		await demoPage.goto();
	});

	test('should load items from the provider', async ({page}) => {
		await renderList(page, {
			autoHref: true,
			dataProvider: 'Provider'
		});

		const
			itemSelector = DOM.elNameSelectorGenerator('b-list', 'item'),
			linkSelector = DOM.elNameSelectorGenerator('b-list', 'link'),
			selector = `${itemSelector}:nth-child(2) ${linkSelector}`;

		await page.click(selector);

		test.expect(await page.evaluate(() => location.hash)).toBe('#bar');
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
