/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';

/**
 * [[include:traits/i-items/README.md]]
 * @packageDocumentation
 */

import { ItemsIterator, ItemPropsFn, UseItemFn } from 'traits/i-items/interface';

export * from 'traits/i-items/interface';

export default abstract class iItems {
	/**
	 * Generates or returns an item key
	 *
	 * @param component
	 * @param el
	 * @param i
	 */
	static getItemKey<T extends iBlock>(component: T & iItems, el: unknown, i: number): CanUndef<string> {
		return Object.isFunction(component.itemKey) ?
			component.itemKey(el, i) :
			component.itemKey;
	}

	/**
	 * Component items
	 */
	abstract readonly itemsProp?: unknown[];

	/** @see [[iItems.itemsProp]] */
	abstract items?: unknown[];

	/** @see [[ItemsIterator]] */
	abstract readonly itemsIterator?: ItemsIterator;

	/**
	 * Item component name or function to create item component name
	 */
	abstract readonly item?: string | UseItemFn;

	/**
	 * Item unique key or function to create item unique key
	 */
	abstract readonly itemKey?: string | UseItemFn;

	/**
	 * Object to mix values into every item props
	 * or factory to create item props
	 */
	abstract readonly itemProps?: StrictDictionary | ItemPropsFn;
}
