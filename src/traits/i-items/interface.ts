/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';

export interface ItemPropParams<CTX = iBlock> {
	/**
	 * Iteration key
	 */
	key?: string;

	/**
	 * Operation context
	 */
	ctx: CTX;
}

/**
 * Factory to create a dictionary with props to pass to every item of a list
 */
export interface ItemPropsFn<ITEM = object, CTX = iBlock> {
	(item: ITEM, i: number, params: ItemPropParams<CTX>): Dictionary;
}

/**
 * Factory to create an item iterator
 */
export interface ItemsIterator<ITEMS = object[], CTX = iBlock> {
	(items: ITEMS, ctx: CTX): ITEMS;
}

/**
 * Function to create value by using item params and its index into a list of items
 */
export interface CreateFromItemFn<ITEM = object> {
	(item: ITEM, i: number): string;
}
