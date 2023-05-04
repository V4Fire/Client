/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

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

	/**
	 * True if item can possibly be active
	 */
	activatable?: boolean;
}

export type Active = unknown | Set<unknown>;

export type ActiveProp = CanIter<unknown>;
