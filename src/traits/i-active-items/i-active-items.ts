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

import SyncPromise from 'core/promise/sync';

import iItems from 'traits/i-items/i-items';

import type { Active, Component, Item } from 'traits/i-active-items/interface';
import type iBlock from 'super/i-block/i-block';

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
	 * @emits `immediateChange(active: CanArray<unknown>)`
	 */
	abstract activeStore: this['Active'];

	/**
	 * Map of item indexes and their values
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

	static getActiveElement = <T extends iBlock>(
		ctx: T & iActiveItems,
		nodeName: string
	): CanPromise<CanUndef<CanArray<HTMLAnchorElement>>> => {
		const
			{active, multiple} = ctx,
			{block} = ctx.unsafe;

		const getEl = (value) => {
			if (value != null) {
				return block?.element<HTMLAnchorElement>(nodeName, {id: value});
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

	static initActiveStore(ctx: Component, value: iActiveItems['Active']): CanUndef<iActiveItems['activeStore']> {
		const
			{multiple, activeStore} = ctx,
			beforeDataCreate = ctx.hook === 'beforeDataCreate';

		let
			newVal;

		if (value === undefined && beforeDataCreate) {
			newVal = activeStore;

			if (multiple && Object.isArray(activeStore)) {
				newVal = new Set(Array.concat([], activeStore));
			}

			return newVal;
		}

		if (multiple) {
			newVal = new Set(Object.isSet(value) ? value : Array.concat([], value));

			if (Object.fastCompare(newVal, activeStore)) {
				return activeStore;
			}

		} else {
			newVal = value;
		}

		if (beforeDataCreate) {
			void ctx.waitStatus('ready').then(() => {
				void Promise.resolve().then(() => ctx.setActive(newVal));
			});

		} else {
			ctx.setActive(newVal);
		}

		if (multiple) {
			return new Set();
		}
	}

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

	static getActive(ctx: Component): iActiveItems['Active'] {
		const
			v = ctx.field.get<iActiveItems['Active']>('activeStore');

		if (ctx.multiple) {
			return Object.isSet(v) ? new Set(v) : new Set();
		}

		return v;
	}

	/** @see [[iActiveItems.isActive]] */
	static isActive: AddSelf<iActiveItems['isActive'], Component> = (ctx, value: Item['value']) => {
		const
			activeStore = ctx.field.get('activeStore');

		if (ctx.multiple) {
			if (!Object.isSet(activeStore)) {
				return false;
			}

			return activeStore.has(value);
		}

		return value === activeStore;
	};

	/**
	 * Initializes component mods
	 */
	static initItemsMods(ctx: Component): void {
		ctx.items?.forEach((item) => {
			const
				{active, value} = item;

			item.mods ??= {};

			item.mods.id = ctx.values.get(item.value);
			item.mods.active = active ?? false;

			if (active && (ctx.multiple ? ctx.activeProp === undefined : ctx.activeStore === undefined)) {
				void Promise.resolve().then(() => ctx.setActive(value));
			}
		});
	}

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
	 */
	abstract toggleActive(value: Item['value'], unsetPrevious?: boolean): iActiveItems['Active'];

	/**
	 * Synchronization of items
	 *
	 * @param items
	 * @param oldItems
	 * @emits `itemsChange(value: this['Items'])`
	 */
	abstract syncItemsWatcher(items: this['Items'], oldItems: this['Items']): void;

	/**
	 * Initializes component values
	 */
	abstract initComponentValues(...args: unknown[]): void;
}
