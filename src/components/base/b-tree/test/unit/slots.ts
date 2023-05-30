/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import DOM from 'tests/helpers/dom';

import { renderTree, checkOptionTree, getDefaultItems } from 'components/base/b-tree/test/helpers';

test.describe('<b-tree> slots', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test.describe('`default`', () => {
		test('should render items using the provided slot', async ({page}) => {
			const items = getDefaultItems();
			const target = await renderTree(page, {
				items,
				children: {
					default: {
						type: 'div',
						children: {
							default: 'Item'
						},
						attrs: {
							'data-test-ref': 'item'
						}
					}
				}
			});

			await test.expect(target.evaluate((ctx) => ctx.isFunctional))
				.toBeResolvedTo(false);

			const
				promises = await Promise.all(checkOptionTree(page, items, {target})),
				refs = await DOM.getRefs(page, 'item');

			test.expect(promises.length).toEqual(refs.length);
		});
	});
});
