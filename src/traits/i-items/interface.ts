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

export interface ItemProps<CTX = unknown> {
	(el: unknown, i: number, params: ItemPropParams<CTX>): Dictionary
}

export interface ItemsIterator<CTX = iBlock> {
	(options: unknown[], ctx: CTX): unknown[];
}
