
/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend from 'components/friends/friend';

import type bList from 'components/base/b-list/b-list';
import { system } from 'core/component';
import type { Item } from 'components/base/b-tree/b-tree';
import iActiveItems from 'components/traits/i-active-items/i-active-items';

export default class Values extends Friend {
	override readonly C!: bList;

	/**
	 * A map of the item indexes and their values
	 */
	@system()
	protected indexes!: Dictionary;

	/**
	 * A map of the item values and their indexes
	 */
	@system()
	protected values!: Map<Item['value'], number>;

	/**
	 * Returns item value for specified index
	 * @param index
	 */
	getValue(index: number | string): Item['value'] {
		return this.indexes[index];
	}

	/**
	 * Returns index of the item for specified value
	 * @param value
	 */
	getIndex(value: Item['value']): CanUndef<number> {
		return this.values.get(value);
	}

	/**
	 * Initializes component values
	 * @param [itemsChanged] - true, if the method is invoked after items changed
	 */
	initComponentValues(itemsChanged: boolean = false): void {
		const
			{ctx} = this,
			values = new Map(),
			indexes = {};

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
				activeItem = <Item>item;
			}

			values.set(val, i);
			indexes[i] = val;
		}

		if (!hasActive) {
			const shouldResetActive = itemsChanged && currentActive != null;

			if (shouldResetActive) {
				this.field.set('activeStore', undefined);
			}

			if (activeItem != null) {
				iActiveItems.initItem(ctx, activeItem);
			}
		}

		this.values = values;
		this.indexes = indexes;
	}
}
