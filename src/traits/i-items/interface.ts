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

/**
 * Factory to create a dictionary with props to pass to every item of a list
 */
export interface ItemPropsFn<CTX = unknown> {
	(el: unknown, i: number, params: ItemPropParams<CTX>): Dictionary;
}

/**
 * Factory to create an item iterator
 */
export interface ItemsIterator<CTX = iBlock> {
	(items: unknown[], ctx: CTX): unknown[];
}

/**
 * Function to create value by using item params and its index into a list of items
 */
export interface CreateFromItemFn {
	(el: unknown, i: number): string;
}
