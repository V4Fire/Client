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
	// @system<Component>((o) => o.sync.link((val) => iActiveItems.initActiveStore(o, val)))
	abstract activeStore: this['Active'];

	/**
	 * Name of node to add active modifier
	 */
	readonly abstract nodeName: string;

	/**
	 * A link to the active item element.
	 * If the component is switched to the `multiple` mode, the getter will return an array of elements.
	 */
	abstract get activeElement(): ReturnType<typeof iActiveItems.getActiveElement>;

	static getActiveElement = <T extends iBlock>(
		ctx: T & iActiveItems
	): CanPromise<CanUndef<CanArray<HTMLAnchorElement>>> => {
		const
			{active, multiple, nodeName} = ctx,
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
				void Promise.resolve().then(() => iActiveItems.setActive(ctx, value));
			});

		} else {
			iActiveItems.setActive(ctx, newVal);
		}
	}

	/**
	 * A component active item/s.
	 * If the component is switched to the `multiple` mode, the getter will return a `Set` object.
	 *
	 * @see [[bList.activeStore]]
	 */
	get active(): this['Active'] {
		return Object.throw();
	}

	static getActive<T extends iBlock & iActiveItems>(ctx: T): iActiveItems['Active'] {
		const
			v = ctx.field.get<iActiveItems['Active']>('activeStore');

		if (ctx.multiple) {
			return Object.isSet(v) ? new Set(v) : new Set();
		}

		return v;
	}

	/** @see [[iAccess.isActive]] */
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

	static setActive: AddSelf<iActiveItems['setActive'], Component> =
		(ctx, value: iActiveItems['Active'], unsetPrevious: boolean = false) => {
		const
			{multiple} = ctx,
			activeStore = ctx.field.get('activeStore');

		if (multiple) {
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

		const
			{nodeName, active, activeElement} = ctx,
			{block: $b} = ctx.unsafe,
			modName = 'active';

		if ($b != null) {
			const
				id = String(value),
				itemEl = $b.element(nodeName, {id});

			if (!multiple || unsetPrevious) {
				const
					previousEls = $b.elements(nodeName, {active: true});

				previousEls.forEach((previousEl) => {
					if (previousEl !== itemEl) {
						$b.setElMod(previousEl, nodeName, modName, false);

						if (previousEl.hasAttribute('aria-selected')) {
							previousEl.setAttribute('aria-selected', 'false');
						}
					}
				});
			}

			SyncPromise.resolve(activeElement).then((selectedElement) => {
				const
					els = Array.concat([], selectedElement);

				els.forEach((el) => {
					$b.setElMod(el, nodeName, modName, true);

					if (el.hasAttribute('aria-selected')) {
						el.setAttribute('aria-selected', 'true');
					}
				});
			}, stderr);
		}

		ctx.emit('immediateChange', active);
		ctx.emit('change', active);

		return true;
	};

	/** @see [[iActiveItems.unsetActive]] */
	static unsetActive: AddSelf<iActiveItems['setActive'], Component> =
		(ctx, value: iActiveItems['Active']) => {
		const
			{activeElement, multiple, cancelable} = ctx,
			activeStore = ctx.field.get('activeStore');

		if (multiple) {
			if (!Object.isSet(activeStore)) {
				return false;
			}

			let
				res = false;

			const unset = (value) => {
				if (!activeStore.has(value) || cancelable === false) {
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

		} else if (activeStore !== value || cancelable !== true) {
			return false;

		} else {
			ctx.field.set('activeStore', undefined);
		}

		const
			{nodeName, active} = ctx,
			{block: $b} = ctx.unsafe;

		if ($b != null) {
			SyncPromise.resolve(activeElement).then((activeElement) => {
				const
					els = Array.concat([], activeElement);

				els.forEach((el) => {
					const
						itemValue = el.getAttribute('data-id') ?? '';

					const needChangeMod = multiple && Object.isSet(value) ?
						value.has(itemValue) :
						value === itemValue;

					if (needChangeMod) {
						$b.setElMod(el, nodeName, 'active', false);

						if (el.hasAttribute('aria-selected')) {
							el.setAttribute('aria-selected', 'false');
						}
					}
				});
			}, stderr);
		}

		ctx.emit('immediateChange', active);
		ctx.emit('change', active);

		return true;
	};

	/** @see [[iActiveItems.toggleActive]] */
	static toggleActive: AddSelf<iActiveItems['toggleActive'], Component> =
		(ctx, value: iActiveItems['Active'], unsetPrevious: boolean = false) => {
		const
			{multiple, active} = ctx,
			activeStore = ctx.field.get('activeStore');

		const
			setActive = iActiveItems.setActive.bind(this, ctx),
			unsetActive = iActiveItems.unsetActive.bind(this, ctx);

		if (multiple) {
			if (!Object.isSet(activeStore)) {
				return active;
			}

			const toggle = (value) => {
				if (activeStore.has(value)) {
					if (unsetPrevious) {
						unsetActive(active);

					} else {
						unsetActive(value);
					}

					return;
				}

				setActive(value, unsetPrevious);
			};

			if (Object.isSet(value)) {
				Object.forEach(value, toggle);

			} else {
				toggle(value);
			}

		} else if (activeStore !== value) {
			setActive(value);

		} else {
			unsetActive(value);
		}

		return active;
	};

	/**
	 * Initializes component mods
	 */
	static initItemsMods(ctx: Component): void {
		ctx.items?.forEach((item) => {
			const
				{active, value} = item;

			item.mods ??= {};

			item.mods.id = String(value);
			item.mods.active = active ?? false;

			if (active && (ctx.multiple ? ctx.activeProp === undefined : ctx.activeStore === undefined)) {
				void Promise.resolve().then(() => iActiveItems.setActive(ctx, value));
			}
		});
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
	setActive(value: iActiveItems['Active'], unsetPrevious: boolean = false): boolean {
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
	unsetActive(value: iActiveItems['Active']): boolean {
		return Object.throw();
	}

	/**
	 * Toggles activation of an item by the specified value.
	 * The methods return a new active component item/s.
	 *
	 * @param value
	 * @param [unsetPrevious] - true, if needed to unset previous active items (works only with the `multiple` mode)
	 */
	toggleActive(value: Item['value'], unsetPrevious: boolean = false): iActiveItems['Active'] {
		return Object.throw();
	}

	/**
	 * Synchronization of items
	 *
	 * @param items
	 * @param oldItems
	 * @emits `itemsChange(value: this['Items'])`
	 */
	abstract syncItemsWatcher(items: this['Items'], oldItems: this['Items']): void;
}
