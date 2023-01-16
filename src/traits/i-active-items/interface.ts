/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ModsTable } from 'super/i-block/modules/mods';
import type iBlock from 'super/i-block/i-block';
import type iActiveItems from 'traits/i-active-items/i-active-items';

export interface Item extends Dictionary {
	/**
	 * Item label text
	 */
	label?: string;

	/**
	 * Item value
	 */
	value: string | number;

	/**
	 * True if the item is active
	 */
	active?: boolean;

	/**
	 * Map of additional modifiers of the item
	 */
	mods?: ModsTable;
}

export type Active = Item['value'] | Set<Item['value']> | undefined;

export type Component<T extends iBlock = iBlock> = T & iActiveItems;
