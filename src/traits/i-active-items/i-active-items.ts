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

import iItems from 'traits/i-items/i-items';
import type { Active, Component, Item } from 'traits/i-active-items/interface';

export * from 'traits/i-items/i-items';
export * from 'traits/i-active-items/interface';

export default abstract class iActiveItems extends iItems {
	/** @see [[iItems.Item]] */
	abstract override readonly Item: Item;

	/**
	 * Type: component active item
	 */
	abstract readonly Active: Active;

	/**
	 * An initial component active item/s value.
	 * If the component is switched to the `multiple` mode,
	 * you can pass an array or Set to define several active items values.
	 *
	 * @prop
	 */
	abstract readonly activeProp?: unknown[] | this['Active'];

	/**
	 * If true, the component supports a feature of multiple active items
	 * @prop
	 */
	abstract readonly multiple: boolean;

	/**
	 * If true, the active item can be unset by using another click to it.
	 * By default, if the component is switched to the `multiple` mode, this value is set to `true`,
	 * otherwise to `false`.
	 *
	 * @prop
	 */
	abstract readonly cancelable?: boolean;

	/**
	 * An internal component active item store.
	 * If the component is switched to the `multiple` mode, the value is defined as a `Set` object.
	 *
	 * @see [[iActiveItems.activeProp]]
	 */
	abstract activeStore: this['Active'];

	/**
	 * Map of item indexes and their values
	 */
	abstract indexes: Dictionary;

	/**
	 * Map of item values and their indexes
	 */
	abstract values: Map<unknown, number>;

	/**
	 * A link to the active item element.
	 * If the component is switched to the `multiple` mode, the getter will return an array of elements.
	 */
	abstract get activeElement(): ReturnType<typeof iActiveItems.getActiveElement>;

	/**
	 * A component active item/s.
	 * If the component is switched to the `multiple` mode, the getter will return a `Set` object.
	 *
	 * @see [[iActiveItems.prototype.activeStore]]
	 */
	abstract get active(): this['Active'];

	/**
	 * Syncs component activeProp and activeStore fields
	 *
	 * @see [[iActiveItems.prototype.activeProp]]
	 * @emits `immediateChange(active: CanArray<unknown>)`
	 */
	static syncActiveStore(ctx: Component, value: iActiveItems['Active']): iActiveItems['Active'] {
		const
			beforeDataCreate = ctx.hook === 'beforeDataCreate';

		if (value === undefined && beforeDataCreate) {
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
			newVal = new Set(Object.isSet(value) ? value : Array.concat([], value));

			if (Object.fastCompare(newVal, ctx.activeStore)) {
				return ctx.activeStore;
			}

		} else {
			newVal = value;
		}

		if (beforeDataCreate) {
			ctx.emit('immediateChange', ctx.multiple ? new Set(newVal) : newVal);

		} else {
			ctx.setActive(newVal);
		}

		return newVal;
	}

	/**
	 * Returns active item/s
	 */
	static getActive(ctx: Component): iActiveItems['Active'] {
		const
			v = ctx.field.get<iActiveItems['Active']>('activeStore');

		if (ctx.multiple) {
			return Object.isSet(v) ? new Set(v) : new Set();
		}

		return v;
	}

	/**
	 * Returns active item element/s
	 */
	static getActiveElement = (ctx: Component, nodeName: string): CanPromise<CanUndef<CanArray<HTMLAnchorElement>>> => {
		const
			{active, multiple} = ctx,
			{block} = ctx.unsafe;

		const getEl = (value) => {
			const
				id = ctx.values.get(value);

			if (id != null) {
				return block?.element<HTMLAnchorElement>(nodeName, {id});
			}
		};

		return ctx.waitStatus('ready', () => {
			if (multiple) {
				if (!Object.isSet(active)) {
					return [];
				}

				return [...active].flatMap((val) => getEl(val) ?? []);
			}

			return getEl(active);
		});
	};

	/** @see [[iActiveItems.prototype.isActive]] */
	static isActive: AddSelf<iActiveItems['isActive'], Component> = (ctx, value: Item['value']) => {
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

	/**
	 * Checks whether the item has active prop value. If true, sets it as active
	 *
	 * @param ctx
	 * @param item
	 */
	static initItemActive(ctx: Component, item: Item): void {
		if (item.active && (ctx.multiple ? ctx.activeProp === undefined : ctx.active === undefined)) {
			ctx.setActive(item.value);
		}
	}

	/** @see [[iActiveItems.prototype.setActive]] */
	static setActive(ctx: Component, value: iActiveItems['Active']): boolean {
		const
			activeStore = ctx.field.get('activeStore');

		if (ctx.multiple) {
			if (!Object.isSet(activeStore)) {
				return false;
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

			if (Object.isSet(value)) {
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

	/** @see [[iActiveItems.prototype.setActive]] */
	static unsetActive(ctx: Component, value: iActiveItems['Active']): boolean {
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

			if (Object.isSet(value)) {
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
	static toggleActive(ctx: Component, value: Item['value'], unsetPrevious?: boolean): iActiveItems['Active'] {
		const
			{active} = ctx;

		if (ctx.multiple) {
			if (!Object.isSet(active)) {
				return ctx.active;
			}

			const toggle = (value) => {
				debugger
				if (active.has(value)) {
					if (unsetPrevious) {
						ctx.unsetActive(ctx.active);

					} else {
						ctx.unsetActive(value);
					}

					return;
				}

				ctx.setActive(value, unsetPrevious);
			};

			if (Object.isSet(value)) {
				Object.forEach(value, toggle);

			} else {
				toggle(value);
			}

		} else if (active !== value) {
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
	 * Activates an item by the specified value.
	 * If the component is switched to the `multiple` mode, the method can take a `Set` object to set multiple items.
	 *
	 * @param value
	 * @param [unsetPrevious] - true, if needed to unset previous active items (works only with the `multiple` mode)
	 *
	 * @emits `change(active: CanArray<unknown>)`
	 * @emits `immediateChange(active: CanArray<unknown>)`
	 */
	setActive(value: Item['value'] | Set<Item['value']>, unsetPrevious?: boolean): boolean {
		return Object.throw();
	}

	/**
	 * Deactivates an item by the specified value.
	 * If the component is switched to the `multiple` mode, the method can take a `Set` object to unset multiple items.
	 *
	 * @param value
	 * @emits `change(active: unknown)`
	 * @emits `immediateChange(active: unknown)`
	 */
	unsetActive(value: Item['value'] | Set<Item['value']>): boolean {
		return Object.throw();
	}

	/**
	 * Toggles activation of an item by the specified value.
	 * The methods return a new active component item/s.
	 *
	 * @param value
	 * @param [unsetPrevious] - true, if needed to unset previous active items (works only with the `multiple` mode)
	 * @emits `change(active: unknown)`
	 * @emits `immediateChange(active: unknown)`
	 */
	toggleActive(value: Item['value'], unsetPrevious?: boolean): iActiveItems['Active'] {
		return Object.throw();
	}

	/**
	 * Initializes component values
	 */
	abstract initComponentValues(): void;
}
