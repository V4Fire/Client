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
	 * Array of item indexes and their values
	 */
	abstract indexes: unknown;

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
	 * Sets a component active item/s.
	 * @see [[iActiveItems.prototype.activeStore]]
	 */
	abstract set active(value: this['Active']);

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
	 * Initializes component mods
	 *
	 * @param ctx
	 * @param item
	 * @param [setActive] - callback to set active element
	 */
	static initItemMods(ctx: Component, item: Item, setActive?: (value) => void): void {
		item.mods ??= {};

		const
			{mods, active, value} = item;

		mods.id = ctx.values.get(value);
		mods.active = false;

		if (active && (ctx.multiple ? ctx.activeProp === undefined : ctx.active === undefined)) {
			if (Object.isFunction(setActive)) {
				setActive(value);
				return;
			}

			ctx.setActive(value);
		}
	}

	/**
	 * Adds the specified value to the component's active store
	 *
	 * @param ctx
	 * @param value
	 */
	static addToActiveStore(ctx: Component, value: iActiveItems['Active']): boolean {
		const
			{multiple, active} = ctx;

		if (multiple) {
			if (!Object.isSet(active)) {
				return false;
			}

			let
				res = false;

			const set = (value) => {
				if (active.has(value)) {
					return;
				}

				active.add(value);
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

			ctx.active = active;

		} else if (active === value) {
			return false;

		} else {
			ctx.active = value;
		}

		return true;
	}

	/**
	 * Removes the specified value from the component's active store
	 *
	 * @param ctx
	 * @param value
	 */
	static removeFromActiveStorage(ctx: Component, value: iActiveItems['Active']): boolean {
		const
			{multiple, cancelable, active} = ctx;

		if (multiple) {
			if (!Object.isSet(active)) {
				return false;
			}

			let
				res = false;

			const unset = (value) => {
				if (!active.has(value) || cancelable === false) {
					return false;
				}

				active.delete(value);
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

			ctx.active = active;

		} else if (active !== value || cancelable !== true) {
			return false;

		} else {
			ctx.active = undefined;
		}

		return true;
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
	abstract setActive(value: Item['value'] | Set<Item['value']>, unsetPrevious?: boolean): boolean;

	/**
	 * Deactivates an item by the specified value.
	 * If the component is switched to the `multiple` mode, the method can take a `Set` object to unset multiple items.
	 *
	 * @param value
	 * @emits `change(active: unknown)`
	 * @emits `immediateChange(active: unknown)`
	 */
	abstract unsetActive(value: Item['value'] | Set<Item['value']>): boolean;

	/**
	 * Toggles activation of an item by the specified value.
	 * The methods return a new active component item/s.
	 *
	 * @param value
	 * @param [unsetPrevious] - true, if needed to unset previous active items (works only with the `multiple` mode)
	 * @emits `change(active: unknown)`
	 * @emits `immediateChange(active: unknown)`
	 */
	abstract toggleActive(value: Item['value'], unsetPrevious?: boolean): iActiveItems['Active'];

	/**
	 * Initializes component values
	 */
	abstract initComponentValues(): void;
}
