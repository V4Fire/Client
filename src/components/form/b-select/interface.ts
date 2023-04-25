/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ModsDict, UnsafeIInputText } from 'components/super/i-input-text/i-input-text';
import type bSelect from 'components/form/b-select/b-select';
import type { Item as Super } from 'components/traits/i-active-items/i-active-items';

export type Value = unknown | Set<unknown>;
export type FormValue = CanUndef<CanArray<unknown>>;

export interface Item extends Super {
	/**
	 * True if the item is selected
	 */
	selected?: boolean;

	/**
	 * Exterior modifier of the item
	 */
	exterior?: string;

	/**
	 * Map of additional modifiers of the item
	 */
	mods?: ModsDict;

	/**
	 * Map of additional classes of the item
	 */
	classes?: Dictionary<string>;

	/**
	 * Map of additional attributes of the item
	 */
	attrs?: Dictionary;
}

export type Items = Item[];

// @ts-ignore (extend)
export interface UnsafeBSelect<CTX extends bSelect = bSelect> extends UnsafeIInputText<CTX> {
	// @ts-ignore (access)
	indexes: CTX['indexes'];

	// @ts-ignore (access)
	values: CTX['values'];

	// @ts-ignore (access)
	setScrollToMarkedOrSelectedItem: CTX['setScrollToMarkedOrSelectedItem'];

	// @ts-ignore (access)
	onNativeChange: CTX['onNativeChange'];

	// @ts-ignore (access)
	onSearchInput: CTX['onSearchInput'];

	// @ts-ignore (access)
	onTextChange: CTX['onTextChange'];

	// @ts-ignore (access)
	onItemClick: CTX['onItemClick'];

	// @ts-ignore (access)
	onItemsNavigate: CTX['onItemsNavigate'];
}
