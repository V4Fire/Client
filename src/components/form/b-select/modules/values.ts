/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { system } from 'core/component';

import Friend from 'components/friends/friend';

import type bSelect from 'components/form/b-select/b-select';
import type { Item } from 'components/form/b-select/interface';

export default class Values extends Friend {
	override readonly C!: bSelect;

	/**
	 * A map of indexes and items
	 */
	@system()
	protected indexes!: Dictionary<Item>;

	/**
	 * A map of item values and their indexes
	 */
	@system()
	protected values!: Map<Item['value'], number>;

	/**
	 * Returns item for specified index
	 * @param index
	 */
	getItem(index: number | string): CanUndef<Item> {
		return this.indexes[index];
	}

	/**
	 * Returns item for specified value
	 * @param index
	 */
	getItemByValue(value: Item['value']): CanUndef<Item> {
		return this.getItem(this.getIndex(value) ?? -1);
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
	 */
	init(): void {
		const
			{ctx} = this;

		const
			values = new Map(),
			indexes = {};

		const
			valueStore = ctx.field.get('valueStore');

		let
			selectedItem;

		for (let i = 0; i < ctx.items.length; i++) {
			const
				item = ctx.items[i];

			if (item.selected && (ctx.multiple ? ctx.valueProp === undefined : valueStore === undefined)) {
				ctx.selectValue(item.value);
			}

			if (ctx.isSelected(item.value)) {
				selectedItem = item;
			}

			values.set(item.value, i);
			indexes[i] = item;
		}

		this.values = values;
		this.indexes = indexes;

		if (!ctx.multiple && selectedItem != null) {
			ctx.field.set('textStore', selectedItem.label);
		}
	}

}
