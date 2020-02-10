
/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';

import { ItemsIterator, ItemProps } from 'traits/i-item/interface';
export * from 'traits/i-item/interface';

export default abstract class iItems {
	/**
	 * Generates or returns an item key
	 *
	 * @param component
	 * @param el
	 * @param i
	 */
	static getItemKey<T extends iBlock>(component: T & iItems, el: unknown, i: number): CanUndef<string> {
		return Object.isFunction(component.optionKey) ?
			component.optionKey(el, i) :
			component.optionKey;
	}

	/**
	 * Component items
	 */
	abstract readonly optionsProp?: unknown[];

	/** @see iItems.prototype.optionProps */
	abstract options: unknown[];

	/**
	 * Factory for an items iterator
	 */
	abstract readonly optionsIterator?: ItemsIterator;

	/**
	 * Item component name
	 */
	abstract readonly option?: string;

	/**
	 * Item unique key
	 */
	abstract readonly optionKey?: string | ((el: unknown, i: number) => string);

	/**
	 * Item component props
	 */
	abstract readonly optionProps: ItemProps;
}
