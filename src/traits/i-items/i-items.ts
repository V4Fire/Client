/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:traits/i-items/README.md]]
 * @packageDocumentation
 */

import iBlock from 'super/i-block/i-block';
import { ItemsIterator, ItemPropsFn, CreateFromItemFn } from 'traits/i-items/interface';

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
	 * Type: component item
	 */
	abstract readonly Item?: object;

	/**
	 * Type: list of component items
	 */
	abstract readonly Items?: Array<this['Item']>;

	/**
	 * List of component items to render
	 */
	abstract readonly itemsProp: unknown[];

	/** @see [[iItems.itemsProp]] */
	abstract items: this['Items'];

	/**
	 * Factory to create an item iterator
	 */
	abstract readonly itemsIterator?: ItemsIterator;

	/**
	 * Item component name.
	 * If provided as a function, it will be invoked.
	 */
	abstract readonly item?: string | CreateFromItemFn;

	/**
	 * Dictionary with props to item components.
	 * If provided as a function, it will be invoked.
	 */
	abstract readonly itemProps?: Dictionary | ItemPropsFn;

	/**
	 * Item unique key to optimize rendering.
	 * If provided as a function, it will be invoked.
	 */
	abstract readonly itemKey?: string | CreateFromItemFn;
}
