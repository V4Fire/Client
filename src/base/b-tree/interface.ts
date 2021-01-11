/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import bTree from 'base/b-tree/b-tree';

/**
 * Tree element data
 */
export interface Item extends Dictionary {
	id: string;

	/**
	 * Parent element identifier
	 * (for nested items)
	 */
	parentId?: string;

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
	(ctx: bTree, el: Item): CanPromise<boolean>;
}
