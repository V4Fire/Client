/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { HintPosition } from 'components/global/g-hint';
import type { ModsDict } from 'components/super/i-data/i-data';

export type Items = Item[];
export type Active = unknown | Set<unknown>;

export interface Item extends Dictionary {
	/**
	 * The item label text
	 */
	label?: string;

	/**
	 * The item value
	 */
	value?: unknown;

	/**
	 * If this option is provided, the component will generate a link for this item
	 */
	href?: string;

	/**
	 * True if the item is active
	 */
	active?: boolean;

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
