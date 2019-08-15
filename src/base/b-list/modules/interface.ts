/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface Option {
	label: string;
	value?: unknown;
	href?: string;
	info?: string;
	theme?: string;
	exterior?: string;
	classes: Dictionary<string>;
	active?: boolean;
	hidden?: boolean;
	progress?: boolean;
	hint?: string;
	preIcon?: string;
	preIconHint?: string;
	preIconComponent?: string;
	icon?: string;
	iconHint?: string;
	iconComponent?: string;
}
