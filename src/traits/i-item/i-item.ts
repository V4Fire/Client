
/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';

export interface ItemPropParams<CTX> {
	key?: string;
	ctx: CTX;
}

export type ItemProps<CTX = unknown> =
	((el: unknown, i: number, params: ItemPropParams<CTX>) => Dictionary) | Dictionary;

export type ItemsIterator<CTX = iBlock> = (options: unknown[], ctx: CTX) => unknown[];

export default abstract class iItem {
	/**
	 * Generates or returns an item key
	 *
	 * @param el
	 * @param i
	 */
	static getOptionKey<T extends iBlock>(component: T & iItem, el: unknown, i: number): CanUndef<string> {
		return Object.isFunction(component.optionKey) ?
			component.optionKey(el, i) :
			component.optionKey;
	}

	/**
	 * Initial component items
	 */
	abstract readonly optionsProp?: unknown[];

	/** @see iItem.optionProps */
	abstract options: unknown[];

	/**
	 * Factory for an items iterator
	 */
	abstract readonly optionsIterator?: ItemsIterator;

	/**
	 * Item component
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
