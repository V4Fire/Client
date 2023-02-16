/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

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
	value?: unknown;

	/**
	 * True if the item is active
	 */
	active?: boolean;
}

export type Active = unknown | Set<unknown>;

export type Component = iBlock & iActiveItems;
