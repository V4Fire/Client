/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import BOM from 'tests/helpers/bom';

import { renderTree, getItemsCount, getRenderedNodesCount } from 'components/base/b-tree/test/helpers';

test.describe('<b-tree> with a data provider', () => {
	const items = [
		{value: 'foo_0_0'},

		{
			value: 'foo_0_1',
			children: [
				{value: 'foo_1_0'},
				{value: 'foo_1_1'},

				{
					value: 'foo_1_2',
					children: [{value: 'foo_2_0'}]
				},

				{value: 'foo_1_3'},
				{value: 'foo_1_4'},
				{value: 'foo_1_5'}
			]
		},

		{value: 'foo_0_2'},
		{value: 'foo_0_3'},
		{value: 'foo_0_4'},
		{value: 'foo_0_5'},
		{value: 'foo_0_6'}
	];

	test.beforeEach(async ({demoPage, context}) => {
		await context.route(/api/, async (route) => route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(items)
		}));

		await demoPage.goto();
	});

	test('should load data from the data provider', async ({page}) => {
		const tree = await renderTree(page, {
			attrs: {
				lazyRender: false,
				dataProvider: 'Provider'
			}
		});

		await BOM.waitForIdleCallback(page);

		test.expect(await getRenderedNodesCount(tree)).toBe(getItemsCount(items));
	});
});
