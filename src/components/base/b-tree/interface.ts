/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bTree from 'components/base/b-tree/b-tree';
import type { Item as Super } from 'components/traits/i-active-items/i-active-items';

/**
 * Tree element data
 */
export interface Item extends Super {
	/**
	 * Item value
	 */
	value: unknown;

	/**
	 * Parent element value
	 * (for nested items)
	 */
	parentValue?: this['value'];

	/**
	 * Nested items
	 */
	children?: Item[];

	/**
	 * Folding flag
	 */
	folded?: boolean;
}

export interface RenderFilter {
	(ctx: bTree, el: Item, i: number): CanPromise<boolean>;
}

export type ClickableAreaMod = 'fold' | 'any';
