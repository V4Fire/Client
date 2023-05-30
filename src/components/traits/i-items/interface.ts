/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iBlock from 'components/super/i-block/i-block';

export type IterationKey = Exclude<Primitive, symbol>;

export interface ItemPropParams<CTX = iBlock> {
	key?: IterationKey;
	ctx: CTX;
}

export interface CreateFromItemFn<ITEM = object, R = unknown> {
	(item: ITEM, i: number): R;
}

export interface ItemPropsFn<ITEM = object, CTX = iBlock> {
	(item: ITEM, i: number, params: ItemPropParams<CTX>): Dictionary;
}
