/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';

import test from 'tests/config/unit/test';

import type bTree from 'components/base/b-tree/b-tree';
import type { Item } from 'components/base/b-tree/b-tree';

import { renderTree } from 'components/base/b-tree/test/helpers';

test.describe('<b-tree> slots', () => {
	const items: Item[] = [
		{
			label: 'root',
			value: '0',
			folded: false,

			children: [
				{
					label: 'item 1',
					value: '1'
				},

				{
					label: 'item 2',
					value: '2'
				}
			]
		}
	];

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test.describe('`default`', () => {
		test('should render items using the provided slot', async ({page}) => {
			const tree = await renderTree(page, {
				items,

				children: {
					default: ({item}) => ({
						type: 'div',

						children: [item.label],

						attrs: {
							'data-test-ref': 'default'
						}
					})
				}
			});

			const slots = await getSlotContent(tree, 'default');

			test.expect(slots).toEqual([
				'root',
				'item 1',
				'item 2'
			]);
		});
	});

	test.describe('`fold`', () => {
		test(
			'should render a collapse icon for all items that have children, using the provided slot',

			async ({page}) => {
				const tree = await renderTree(page, {
					items,

					children: {
						fold: ({params}) => ({
							type: 'div',

							children: ['+'],

							attrs: {
								'data-test-ref': 'fold',
								'v-attrs': params
							}
						})
					}
				});

				const slots = await getSlotContent(tree, 'fold');
				test.expect(slots).toEqual(['+']);
			}
		);
	});

	function getSlotContent(tree: JSHandle<bTree>, slot: string) {
		return tree.evaluate((ctx, slot) => {
			const nodes = ctx.$el!.querySelectorAll(`[data-test-ref="${slot}"]`);
			return Array.from(nodes).map((el) => el.innerHTML);
		}, slot);
	}
});
