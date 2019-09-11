/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ModsTable } from 'form/b-input/b-input';

export type FormValue = CanUndef<
	string
>;

export interface Option {
	label: string;
	inputLabel?: string;
	value?: unknown;
	selected?: boolean;
	marked?: boolean;
	exterior?: string;
	classes?: Dictionary<string>;
	mods?: ModsTable;
	attrs?: Dictionary;
}

export interface NOption extends Option {
	value: string;
}
