/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { HintPosition } from 'components/global/g-hint/g-hint';

import type { ModsDict, UnsafeIData } from 'components/super/i-data/i-data';

import type { Item as Super } from 'components/traits/i-active-items/i-active-items';
import type bList from 'components/base/b-list/b-list';

export type Items = Item[];

export interface Item extends Super {
	/**
	 * Item label text
	 */
	label?: string;

	/**
	 * If this option is provided, the component will generate a link for this item
	 */
	href?: string;

	/**
	 * True if the item is hidden
	 */
	hidden?: boolean;

	/**
	 * True if the item is in-progress
	 */
	progress?: boolean;

	/**
	 * The item exterior modifier
	 */
	exterior?: string;

	/**
	 * The item tooltip text
	 */
	hint?: string;

	/**
	 * The item tooltip position
	 */
	hintPos?: HintPosition;

	/**
	 * An icon to show before the item label
	 */
	preIcon?: string;

	/**
	 * The name of the used component to display `preIcon`
	 */
	preIconComponent?: string;

	/**
	 * An icon to show after the item label
	 */
	icon?: string;

	/**
	 * The name of the used component to display `icon`
	 */
	iconComponent?: string;

	/**
	 * A component to show "in-progress" state or
	 * Boolean, if needed to show progress by slot or `b-progress-icon`
	 */
	progressIcon?: string | boolean;

	/**
	 * A dictionary with additional modifiers of the item
	 */
	mods?: ModsDict;

	/**
	 * A list of additional classes of the item
	 */
	classes?: string[];

	/**
	 * A dictionary with additional attributes of the item
	 */
	attrs?: Dictionary;
}

// @ts-ignore (extend)
export interface UnsafeBList<CTX extends bList = bList> extends UnsafeIData<CTX> {
	// @ts-ignore (access)
	itemsStore: CTX['itemsStore'];

	// @ts-ignore (access)
	normalizeItems: CTX['normalizeItems'];
}
