/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend from 'components/friends/friend';
import iActiveItems from 'components/traits/i-active-items/i-active-items';

import type bList from 'components/base/b-list/b-list';
import type { Item } from 'components/base/b-list/b-list';

export default class Values extends Friend {
	/** @inheritDoc */
	declare readonly C: bList;

	/**
	 * A map of the item indexes and their values
	 */
	protected indexes!: Dictionary;

	/**
	 * A map of the item values and their indexes
	 */
	protected values!: Map<Item['value'], number>;

	/**
	 * A map of the item values and their descriptors
	 */
	protected valueItems!: Map<unknown, Item>;

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
		return this.values.get(value);
	}

	/**
	 * Returns the item by the specified value
	 * @param value
	 */
	getItem(value: Item['value']): CanUndef<Item> {
		return this.valueItems.get(value);
	}

	/**
	 * Initializes component values
	 * @param [itemsChanged] - true, if the method is invoked after items changed
	 */
	init(itemsChanged: boolean = false): void {
		const
			{ctx} = this;

		const
			values = new Map(),
			valueItems = new Map(),
			indexes = {};

		this.values = values;
		this.valueItems = valueItems;
		this.indexes = indexes;

		const
			{active: currentActive} = ctx;

		let
			hasActive = false,
			activeItem: Item | undefined;

		for (let i = 0; i < ctx.items.length; i++) {
			const
				item = ctx.items[i],
				val = item.value;

			if (item.active === currentActive) {
				hasActive = true;
			}

			if (item.active) {
				activeItem = item;
			}

			values.set(val, i);
			valueItems.set(val, item);
			indexes[i] = val;
		}

		if (!hasActive) {
			const shouldResetActive = itemsChanged && currentActive != null;

			if (shouldResetActive) {
				this.field.set('activeStore', undefined);
			}

			if (activeItem != null) {
				iActiveItems.initItem(this.component, activeItem);
			}
		}
	}
}
