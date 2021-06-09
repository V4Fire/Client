/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ModsTable } from 'super/i-input-text/i-input-text';

export type Value = unknown | Set<unknown>;
export type FormValue = CanUndef<Value>;

export interface Item extends Dictionary {
	/**
	 * Item label text
	 */
	label?: string;

	/**
	 * Item value
	 */
	value?: unknown;

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
	mods?: ModsTable;

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
