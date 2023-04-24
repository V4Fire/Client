/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import BOM from 'tests/helpers/bom';

import { renderTree, waitForCheckboxCount, interceptTreeRequest } from 'components/base/b-tree/test/helpers';

test.describe('<b-tree> with a data provider', () => {
	test.beforeEach(async ({demoPage, context}) => {
		await interceptTreeRequest(context);
		await demoPage.goto();
	});

	test('should load data from the data provider', async ({page}) => {
		await renderTree(
			page,
			{
				attrs: {
					dataProvider: 'Provider',
					item: 'b-checkbox-functional'
				}
			}
		);

		await BOM.waitForIdleCallback(page);

		await waitForCheckboxCount(page, 14);
	});

});
