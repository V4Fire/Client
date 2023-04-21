
/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { system } from 'core/component';

import Friend from 'components/friends/friend';

import type bTree from 'components/base/b-tree/b-tree';
import type { Item } from 'components/base/b-tree/b-tree';
import iActiveItems from 'components/traits/i-active-items/i-active-items';

export default class Values extends Friend {
	override readonly C!: bTree;

	/**
	 * A map of the item indexes and their values
	 */
	@system()
	protected indexes!: Dictionary;

	/**
	 * A map of the item values and their indexes
	 */
	@system()
	protected valueIndexes!: Map<Item['value'], number>;

	/**
	 * A map of the item values and their descriptors
	 */
	@system()
	protected valueItems!: Map<Item['value'], Item>;

	/**
	 * This prefix guarantees component :key uniqueness after item changes
	 */
	@system()
	protected itemKeyPrefix: number = 0;

	/**
	 * Returns the item value by the specified index
	 * @param index
	 */
	getValue(index: number | string): Item['value'] {
		return this.indexes[index];
	}

	/**
	 * Returns the item index by the specified value
	 * @param value
	 */
	getIndex(value: Item['value']): CanUndef<number> {
		return this.valueIndexes.get(value);
	}

	/**
	 * Returns an item by specified value
	 * @param value
	 */
	getItem(value: Item['value']): CanUndef<Item> {
		return this.valueItems.get(value);
	}

	/**
	 * Returns the render key for the passed item
	 */
	getItemKey(value: Item['value']): string {
		return `${this.itemKeyPrefix}-${this.getIndex(value)}`;
	}

	/**
	 * Initializes component values
	 * @param [itemsChanged] - true, if the method is invoked after items changed
	 */
	init(itemsChanged: boolean = false): void {
		const
			that = this,
			{ctx, ctx: {active}} = this;

		let
			hasActive = false,
			activeItem;

		if (ctx.topProp == null) {
			this.itemKeyPrefix++;
			this.indexes = {};
			this.valueIndexes = new Map();
			this.valueItems = new Map();

			traverse(ctx.field.get('itemsStore'));

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (!hasActive) {
				if (itemsChanged && active != null) {
					ctx.field.set('activeStore', undefined);
				}

				if (activeItem != null) {
					iActiveItems.initItem(ctx, activeItem);
				}
			}

		} else {
			['indexes', 'valueIndexes', 'valueItems'].forEach((property) => {
				Object.defineProperty(this, property, {
					enumerable: true,
					configurable: true,
					get: () => ctx.topProp?.unsafe.values[property]
				});
			});
		}

		function traverse(items?: Array<bTree['Item']>) {
			items?.forEach((item) => {
				const
					{value} = item;

				if (that.valueIndexes.has(value)) {
					return;
				}

				const
					id = that.valueIndexes.size;

				that.indexes[id] = value;
				that.valueIndexes.set(value, id);
				that.valueItems.set(value, item);

				if (item.value === active) {
					hasActive = true;
				}

				if (item.active) {
					activeItem = item;
				}

				if (Object.isArray(item.children)) {
					traverse(item.children);
				}
			});
		}
	}
}
