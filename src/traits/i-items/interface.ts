/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';

/**
 * Params to provide to an item
 */
export interface ItemPropParams<CTX> {
	key?: string;
	ctx: CTX;
}

/**
 * Factory to create props to pass to every item
 */
export interface ItemPropsFn<CTX = unknown> {
	(el: unknown, i: number, params: ItemPropParams<CTX>): Dictionary;
}

/**
 * Factory for an item iterator
 */
export interface ItemsIterator<CTX = iBlock> {
	(options: unknown[], ctx: CTX): unknown[];
}

/**
 * Function to create value using item params and its index into items array
 */
export interface CreateFromItemFn {
	(el: unknown, i: number): string;
}
