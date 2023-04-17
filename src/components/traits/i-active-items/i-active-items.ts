/* eslint-disable @typescript-eslint/no-unused-vars-experimental */

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:traits/i-active-items/README.md]]
 * @packageDocumentation
 */

import type iBlock from 'components/super/i-block/i-block';

import iItems from 'components/traits/i-items/i-items';
import type { Active, ActiveInput, Item } from 'components/traits/i-active-items/interface';

export * from 'components/traits/i-items/i-items';
export * from 'components/traits/i-active-items/interface';

type TraitComponent = iBlock & iActiveItems;

export default abstract class iActiveItems extends iItems {
	/** @see [[iItems.Item]] */
	abstract override readonly Item: Item;

	/**
	 * Type: the component active item
	 */
	abstract readonly Active: Active;

	/**
	 * Type: the component active input for `activeProp`, `setActive`, `toggleActive`, `unsetActive`
	 */
	abstract readonly ActiveInput: ActiveInput;

	/**
	 * The active item(s) of the component.
	 * If the component is switched to "multiple" mode, you can pass in an iterable to define multiple active elements.
	 *
	 * @prop
	 */
	abstract readonly activeProp?: this['ActiveInput'];

	/**
	 * If true, the component supports the multiple active items feature
	 * @prop
	 */
	abstract readonly multiple: boolean;

	/**
	 * If set to true, the active item can be canceled by clicking it again.
	 * By default, if the component is switched to the `multiple` mode, this value is set to `true`,
	 * otherwise it is set to `false`.
	 *
	 * @prop
	 */
	abstract readonly cancelable?: boolean;

	/**
	 * The active item(s) of the component.
	 * If the component is switched to "multiple" mode, the getter will return a Set.
	 *
	 * @see [[iActiveItems.prototype.activeStore]]
	 */
	abstract get active(): this['Active'];

	/**
	 * The component internal active item store.
	 * If the component is switched to the `multiple` mode, the value is defined as a Set.
	 *
	 * @see [[iActiveItems.activeProp]]
	 */
	abstract activeStore: this['Active'];

	/**
	 * Link(s) to the DOM element of the component active item.
	 * If the component is switched to the `multiple` mode, the getter will return a list of elements.
	 */
	abstract get activeElement(): CanPromise<CanArray<Element> | null>;

	/**
	 * Returns a `sync.link` to `activeProp` for `activeStore`
	 *
	 * @param ctx
	 * @param [modifyVal]
	 * @emits `immediateChange(active: CanIter<unknown>)`
	 */
	static linkActiveStore(ctx: TraitComponent, modifyVal?: (val: iActiveItems['Active']) => iActiveItems['Active']): iActiveItems['Active'] {
		return ctx.sync.link('activeProp', (val: iActiveItems['Active']) => {
			val = modifyVal?.(val) ?? val;

			const
				beforeDataCreate = ctx.hook === 'beforeDataCreate';

			if (val === undefined && beforeDataCreate) {
				if (ctx.multiple) {
					if (Object.isSet(ctx.activeStore)) {
						return ctx.activeStore;
					}

					return new Set(Array.concat([], ctx.activeStore));
				}

				return ctx.activeStore;
			}

			let
				newVal;

			if (ctx.multiple) {
				newVal = new Set(Object.isIterable(val) ? val : Array.concat([], val));

				if (Object.fastCompare(newVal, ctx.activeStore)) {
					return ctx.activeStore;
				}

			} else {
				newVal = val;
			}

			if (beforeDataCreate) {
				ctx.emit('immediateChange', ctx.multiple ? new Set(newVal) : newVal);

			} else {
				ctx.setActive(newVal);
			}

			return newVal;
		});
	}

	/**
	 * Checks if the passed item has an active property value.
	 * If true, sets it as the component active value.
	 *
	 * @param ctx
	 * @param item
	 */
	static initItem(ctx: TraitComponent, item: Item): void {
		if (item.active && (ctx.multiple ? ctx.activeProp === undefined : (<Set<iActiveItems['Active']>>ctx.active).size === 0)) {
			ctx.setActive(item.value);
		}
	}

	/**
	 * Returns the active item(s) of the passed component
	 */
	static getActive(ctx: TraitComponent): iActiveItems['Active'] {
		const
			v = ctx.field.get<iActiveItems['Active']>('activeStore');

		if (ctx.multiple) {
			return Object.isSet(v) ? new Set(v) : new Set();
		}

		return v;
	}

	/** @see [[iActiveItems.prototype.isActive]] */
	static isActive: AddSelf<iActiveItems['isActive'], TraitComponent> = (ctx, value: Item['value']) => {
		const
			{active} = ctx;

		if (ctx.multiple) {
			if (!Object.isSet(active)) {
				return false;
			}

			return active.has(value);
		}

		return value === active;
	};

	/** @see [[iActiveItems.prototype.setActive]] */
	static setActive(ctx: TraitComponent, value: iActiveItems['ActiveInput'], unsetPrevious?: boolean): boolean {
		const
			activeStore = ctx.field.get('activeStore');

		if (ctx.multiple) {
			if (!Object.isSet(activeStore)) {
				return false;
			}

			if (unsetPrevious) {
				ctx.field.set('activeStore', new Set());
			}

			let
				res = false;

			const set = (value) => {
				if (activeStore.has(value)) {
					return;
				}

				activeStore.add(value);
				res = true;
			};

			if (Object.isIterable(value)) {
				Object.forEach(value, set);

			} else {
				set(value);
			}

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (!res) {
				return false;
			}

		} else if (activeStore === value) {
			return false;

		} else {
			ctx.field.set('activeStore', value);
		}

		ctx.emit('immediateChange', ctx.active);
		ctx.emit('change', ctx.active);

		return true;
	}

	/** @see [[iActiveItems.prototype.unsetActive]] */
	static unsetActive(ctx: TraitComponent, value: iActiveItems['ActiveInput']): boolean {
		const
			activeStore = ctx.field.get('activeStore');

		if (ctx.multiple) {
			if (!Object.isSet(activeStore)) {
				return false;
			}

			let
				res = false;

			const unset = (value) => {
				if (!activeStore.has(value) || ctx.cancelable === false) {
					return false;
				}

				activeStore.delete(value);
				res = true;
			};

			if (Object.isIterable(value)) {
				Object.forEach(value, unset);

			} else {
				unset(value);
			}

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (!res) {
				return false;
			}

		} else if (activeStore !== value || ctx.cancelable !== true) {
			return false;

		} else {
			ctx.field.set('activeStore', undefined);
		}

		ctx.emit('immediateChange', ctx.active);
		ctx.emit('change', ctx.active);

		return true;
	}

	/** @see [[iActiveItems.prototype.toggleActive]] */
	static toggleActive(ctx: TraitComponent, value: iActiveItems['ActiveInput'], unsetPrevious?: boolean): iActiveItems['Active'] {
		const
			activeStore = ctx.field.get('activeStore');

		if (ctx.multiple) {
			if (!Object.isSet(activeStore)) {
				return ctx.active;
			}

			const toggle = (value) => {
				if (activeStore.has(value)) {
					ctx.unsetActive(value);
					return;
				}

				ctx.setActive(value);
			};

			if (Object.isIterable(value)) {
				if (unsetPrevious) {
					ctx.unsetActive(ctx.active);
				}

				Object.forEach(value, toggle);

			} else {
				toggle(value);
			}

		} else if (activeStore !== value) {
			ctx.setActive(value);

		} else {
			ctx.unsetActive(value);
		}

		return ctx.active;
	}

	/**
	 * Returns true if the specified value is active
	 * @param value
	 */
	isActive(value: Item['value']): boolean {
		return Object.throw();
	}

	/**
	 * Activates the item(s) by the specified value(s).
	 * If the component is switched to the `multiple` mode, the method can take a Set to set multiple items.
	 *
	 * @param value
	 * @param [unsetPrevious] - true, if needed to reset previous active items (only works in the `multiple` mode)
	 *
	 * @emits `change(active: CanIter<unknown>)`
	 * @emits `immediateChange(active: CanIter<unknown>)`
	 */
	setActive(value: Item['value'] | Iterable<Item['value']>, unsetPrevious?: boolean): boolean {
		return Object.throw();
	}

	/**
	 * Deactivates the item(s) by the specified value(s).
	 * If the component is switched to the `multiple` mode, the method can take a Set to unset multiple items.

	 * @param value
	 * @emits `change(active: unknown)`
	 * @emits `immediateChange(active: unknown)`
	 */
	unsetActive(value: Item['value'] | Iterable<Item['value']>): boolean {
		return Object.throw();
	}

	/**
	 * Toggles item activation by the specified value.
	 * The methods return the new active component item(s).
	 *
	 * @param value
	 * @param [unsetPrevious] - true, if needed to reset previous active items (only works in the `multiple` mode)
	 *
	 * @emits `change(active: unknown)`
	 * @emits `immediateChange(active: unknown)`
	 */
	toggleActive(value: Item['value'] | Iterable<Item['value']>, unsetPrevious?: boolean): iActiveItems['Active'] {
		return Object.throw();
	}
}
