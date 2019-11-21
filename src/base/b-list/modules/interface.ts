/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface Option {
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
	preIconComponent?: string;
	preIconHint?: string;
	preIconHintPos?: string;
	icon?: string;
	iconComponent?: string;
	iconHint?: string;
	iconHintPos?: string;
	progressIcon?: string;
	attrs?: Dictionary;
}
