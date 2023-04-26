/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import AssertBase from 'tests/helpers/assert/base';

import type { AssertComponentItemsHaveMod, ComponentItemIds, ModVal } from 'tests/helpers/assert/component/interface';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class AssertComponent extends AssertBase {
	/**
	 * Returns an assert function which accepts mod value and item ids.
	 * Assert function searches items by `data-id` attribute.
	 *
	 * @param modName
	 *
	 * @example
	 * ```typescript
	 * const itemsAreActive = AssertComponent.itemsHaveMod('active', true); // Function,
	 * await itemsAreActive([1]);
	 *
	 * const itemsAreInactive = AssertComponent.itemsHaveMod('active', false);
	 * await itemsAreInactive([0, 2]);
	 * ```
	 */
	static itemsHaveMod(modName: string): AssertComponentItemsHaveMod;

	/**
	 * Returns an assert function which accepts mod value and item ids.
	 * Assert function searches items by `data-id` attribute.
	 *
	 * @param modName
	 *
	 * @example
	 * ```typescript
	 * const itemsHaveActiveMod = AssertComponent.itemsHaveMod('active', true);
	 * await itemsHaveActiveMod(true, [0, 1]);
	 * ```
	 */
	static itemsHaveMod(modName: string, value: ModVal): (itemIds: ComponentItemIds) => Promise<void>;

	/**
	 * Asserts that items with given ids have the modifier with specified value.
	 * Searches items by `data-id` attribute.
	 *
	 * @param modName
	 * @param value
	 * @param itemIds
	 *
	 * @example
	 * ```typescript
	 * await AssertComponent.itemsHaveMod('active', true, [0, 1]);
	 * ```
	 */
	static itemsHaveMod(
		modName: string,
		value: ModVal,
		itemIds: ComponentItemIds
	): Promise<void>;

	static itemsHaveMod(
		modName: string,
		value?: ModVal,
		itemIds?: ComponentItemIds
	): AssertComponentItemsHaveMod | ((itemIds: ComponentItemIds) => Promise<void>) | Promise<void> {
		const assert: AssertComponentItemsHaveMod = async (value, itemIds) => {
			const regex = new RegExp(`${modName}_${value}`);

			for (const itemId of itemIds) {
				await test.expect(this.page!.locator(`[data-id="${itemId}"]`)).toHaveClass(regex);
			}
		};

		if (itemIds != null && value != null) {
			return assert(value, itemIds);
		}

		if (value != null) {
			return (itemIds: ComponentItemIds) => assert(value, itemIds);
		}

		return assert;
	}
}

