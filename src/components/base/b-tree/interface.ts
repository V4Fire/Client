/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { UnsafeIData } from 'components/super/i-data/i-data';

import type bTree from 'components/base/b-tree/b-tree';
import type { Item as Super } from 'components/traits/i-active-items/i-active-items';

export type LazyRenderMode = 'all' | 'folded' | 'items';
export type LazyRender = boolean | LazyRenderMode;

export interface Item extends Super {
	/**
	 * The label text for the item
	 */
	label?: string;

	/**
	 * The value of the parent element (for nested items)
	 */
	parentValue?: this['value'];

	/**
	 * The nested items for this item
	 */
	children?: Item[];

	/**
	 * A flag indicating whether the item is folded or not
	 */
	folded?: boolean;
}

export interface ItemMeta {
	id: CanUndef<number>;
	value: CanUndef<unknown>;
}

export interface RenderFilter {
	(ctx: bTree, el: Item, i: number): CanPromise<boolean>;
}

// @ts-ignore (unsafe)
export interface UnsafeBTree<CTX extends bTree = bTree> extends UnsafeIData<CTX> {
	// @ts-ignore (access)
	hasChildren: CTX['hasChildren'];

	// @ts-ignore (access)
	findItemElement: CTX['findItemElement'];

	// @ts-ignore (access)
	traverseActiveNodes: CTX['traverseActiveNodes'];

	// @ts-ignore (access)
	top: CTX['top'];

	// @ts-ignore (access)
	values: CTX['values'];

	// @ts-ignore (access)
	unfoldedStore: CTX['unfoldedStore'];
}
