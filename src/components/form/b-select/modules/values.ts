/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend from 'components/friends/friend';

import type bSelect from 'components/form/b-select/b-select';
import type { Item } from 'components/form/b-select/interface';

export default class Values extends Friend {
	/** @inheritDoc */
	declare readonly C: bSelect;

	/**
	 * A map of the item indexes and their values
	 */
	protected indexes!: Dictionary<Item>;

	/**
	 * A map of the item values and their indexes
	 */
	protected values!: Map<Item['value'], number>;

	/**
	 * Returns the item index by the specified value
	 * @param value
	 */
	getIndex(value: Item['value']): CanUndef<number> {
		return this.values.get(value);
	}

	/**
	 * Returns the item by the specified index
	 * @param index
	 */
	getItem(index: number | string): CanUndef<Item> {
		return this.indexes[index];
	}

	/**
	 * Returns the item by the specified value
	 * @param value
	 */
	getItemByValue(value: Item['value']): CanUndef<Item> {
		return this.getItem(this.getIndex(value) ?? -1);
	}

	/**
	 * Initializes component values
	 */
	init(): void {
		const
			{ctx} = this;

		const
			values = new Map(),
			indexes = {};

		this.values = values;
		this.indexes = indexes;

		const
			activeStore = ctx.field.get('activeStore');

		let
			selectedItem;

		ctx.items.forEach((item, i) => {
			if (item.selected && (ctx.multiple ? ctx.valueProp === undefined : activeStore === undefined)) {
				ctx.selectValue(item.value);
			}

			if (ctx.isSelected(item.value)) {
				selectedItem = item;
			}

			values.set(item.value, i);
			indexes[i] = item;
		});

		if (!ctx.multiple && selectedItem != null) {
			ctx.field.set('textStore', selectedItem.label);
		}
	}
}
