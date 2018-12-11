/*!
 * V4Fire Core
 * https://github.com/V4Fire/Core
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Core/blob/master/LICENSE
 */

export interface Experiment<T, I> {
	id: I;
	target: T;
	source: Dictionary;
	meta?: Dictionary;
}

export type Target = 'api' | 'ui';
export type ExperimentID = string | number;
export type ExperimentsSet = Experiment<Target, ExperimentID>[];
