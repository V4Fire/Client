/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';

export type IterationKey =
	string |
	number |
	boolean;

export interface ItemPropParams<CTX = iBlock> {
	key?: IterationKey;
	ctx: CTX;
}

/**
 * Factory to create a value from an item object and its index
 */
export interface CreateFromItemFn<ITEM = object, R = unknown> {
	(item: ITEM, i: number): R;
}

/**
 * Factory to create a dictionary with props to pass to every item of a list
 */
export interface ItemPropsFn<ITEM = object, CTX = iBlock> {
	(item: ITEM, i: number, params: ItemPropParams<CTX>): Dictionary;
}
