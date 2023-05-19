/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Locator } from 'playwright';

import test from 'tests/config/unit/test';

import AssertBase from 'tests/helpers/assert/base';

import type {

	AssertComponentItemsHaveMod,
	AssertItems,
	ComponentItemId,
	ComponentItemIds,
	ModVal

} from 'tests/helpers/assert/component/interface';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class AssertComponent extends AssertBase {
	static readonly inverted: boolean = false;

	/**
	 * Returns a class with the `inverted` property set to `true`
	 */
	static get not(): typeof AssertComponent {
		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		return class extends AssertComponent {
			static override inverted: boolean = true;
		}
			.setPage(this.page!) as typeof AssertComponent;
	}

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
	static itemsHaveMod(modName: string, value: ModVal): AssertItems;

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
		itemIds: ComponentItemIds | ComponentItemId
	): Promise<void>;

	static itemsHaveMod(
		modName: string,
		value?: ModVal,
		itemIds?: ComponentItemIds | ComponentItemId
	): AssertComponentItemsHaveMod | AssertItems | Promise<void> {
		const assert: AssertComponentItemsHaveMod = async (value, itemIds) => {
			const regex = new RegExp(`${modName}_${value}`);

			for (const locator of this.iterateItems(itemIds)) {
				const expect = test.expect(locator);
				if (this.inverted) {
					await expect.not.toHaveClass(regex);
				} else {
					await expect.toHaveClass(regex);
				}
			}
		};

		if (itemIds != null && value != null) {
			return assert(value, Array.concat([], itemIds));
		}

		if (value != null) {
			return (itemIds) => assert(value, itemIds);
		}

		return assert;
	}

	/**
	 * Returns an assert function which checks if items have the specified class.
	 * It accepts item ids and searches them by `data-id` attribute.
	 *
	 * @param className
	 *
	 * @example
	 * ```typescript
	 * const itemsAreActive = AssertComponent.itemsHaveClass('active'); // Function,
	 * await itemsAreActive([1]);
	 *
	 * const itemsAreInactive = AssertComponent.not.itemsHaveClass('active'); // Function,
	 * await itemsAreInactive([1]);
	 * ```
	 */
	static itemsHaveClass(className: string | RegExp): AssertItems;

	/**
	 * Checks if items have the specified class
	 *
	 * @param className
	 * @param itemIds
	 *
	 * @example
	 * ```typescript
	 * await AssertComponent.itemsHaveClass('active', [0, 1]);
	 *
	 * await AssertComponent.not.itemsHaveClass('active', [0, 1]);
	 * ```
	 */
	static itemsHaveClass(
		className: string | RegExp,
		itemIds: ComponentItemIds | ComponentItemId
	): Promise<void>;

	static itemsHaveClass(
		className: string | RegExp,
		itemIds?: ComponentItemIds | ComponentItemId
	): AssertItems | Promise<void> {
		const assert = async (itemIds: ComponentItemIds | ComponentItemId) => {
			for (const locator of this.iterateItems(itemIds)) {
				const expect = test.expect(locator);
				if (this.inverted) {
					await expect.not.toHaveClass(className);
				} else {
					await expect.toHaveClass(className);
				}
			}
		};

		if (itemIds != null) {
			return assert(Array.concat([], itemIds));
		}

		return assert;
	}

	/**
	 * Returns iterable iterator of item locators
	 * @param itemIds
	 */
	protected static iterateItems(itemIds: ComponentItemIds | ComponentItemId): IterableIterator<Locator> {
		const iter = createIter();

		return {
			[Symbol.iterator]() {
				return this;
			},
			next: iter.next.bind(iter)
		};

		function* createIter() {
			for (const itemId of Array.concat([], itemIds)) {
				yield AssertComponent.page!.locator(`[data-id="${itemId}"]`);
			}
		}
	}
}

