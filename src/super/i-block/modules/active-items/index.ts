/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-block/modules/active-items/README.md]]
 * @packageDocumentation
 */

import type iBlock from 'super/i-block/i-block';

import Friend from 'super/i-block/modules/friend';
import type iItems from "traits/i-items/i-items";
import iActiveItems, {Item} from "traits/i-active-items/i-active-items";
import {system} from "super/i-block/i-block";

export * from 'super/i-block/modules/active-items/interface';

/**
 * Class provides API to work with items' activation
 */
export default class ActiveItems extends Friend {
	override C!: Сщь;

	constructor(component: iBlock & iActiveItems) {
		super(component);

		component.items?.forEach((item) => {
			item.mods ??= {};

			if (item.active) {
				iActiveItems.setActive(component, item);

			} else {
				item.mods.active = false;
			}

			item.mods.id = String(item.value);
		});

		this.initActiveItems(component.activeProp);
	}

	/**
	 * An internal component active item store.
	 * If the component is switched to the `multiple` mode, the value is defined as a `Set` object.
	 *
	 * @see [[bList.activeProp]]
	 * @emits `immediateChange(active: CanArray<unknown>)`
	 */
	initActiveItems(val: unknown): iActiveItems['activeStore'] {
		const
			{multiple, activeStore} = this.ctx;

		const
			beforeDataCreate = this.ctx.hook === 'beforeDataCreate';

		if (val === undefined && beforeDataCreate) {
			if (multiple) {
				if (Object.isSet(activeStore)) {
					return activeStore;
				}

				return new Set(Array.concat([], activeStore));
			}

			return activeStore;
		}

		let
			newVal;

		if (multiple) {
			const
				objVal = new Set(Object.isSet(val) ? val : Array.concat([], val));

			if (Object.fastCompare(objVal, activeStore)) {
				return activeStore;
			}

			newVal = objVal;

		} else {
			newVal = val;
		}

		if (beforeDataCreate) {
			this.ctx.emit('immediateChange', multiple ? new Set(newVal) : newVal);

		} else {
			this.setActive(newVal);
		}

		return newVal;
	}

}
