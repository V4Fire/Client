/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface Experiment<T, I> {
	id: I;
	target: T;
	source: Dictionary;
	meta?: Meta;
}

export interface Meta extends Dictionary {
	mods?: Dictionary<string | boolean>;
}

export type Target = 'api' | 'ui';
export type ExperimentID = string | number;
export type ExperimentsSet = Experiment<Target, ExperimentID>[];
