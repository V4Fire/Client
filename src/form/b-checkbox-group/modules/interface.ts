/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ModsTable } from 'super/i-input/i-input';

export type Value = CanUndef<CanArray<string>>;
export type FormValue = Value;

export interface Option extends Dictionary {
	name: string;
	id?: string;
	label?: string;
	exterior?: string;
	classes?: Dictionary<string>;
	mods?: ModsTable;
}

export type Counters = [number, number];

export interface NestedOption extends Option {
	id: string;
	level: number;
	parent?: string;
}

interface TreeStyledCheckbox extends NestedOption {
	children?: TreeStyledCheckbox[];
}
