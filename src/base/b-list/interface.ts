/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface Item {
	label?: string;
	value?: unknown;
	href?: string;
	info?: string;
	active?: boolean;
	hidden?: boolean;
	progress?: boolean;
	exterior?: string;
	classes?: Dictionary<string>;
	hint?: string;

	preIcon?: string;

	/**
	 * Name of used component to show `preIcon`
	 * @default `'b-icon'`
	 */
	preIconComponent?: string;

	/**
	 * Text of a hint that is shown on hovering of `preIcon`
	 */
	preIconHint?: string;

	/**
	 * Position of a `preIcon` hint to show
	 */
	preIconHintPos?: string;

	icon?: string;
	iconComponent?: string;
	iconHint?: string;
	iconHintPos?: string;
	progressIcon?: string;

	/**
	 * Dictionary with extra HTML attributes of an item
	 */
	attrs?: Dictionary;
}
