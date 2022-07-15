/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export type ExperimentId = string | number;
export type ExperimentTarget = 'api' | 'ui';

export interface Experiment<T, I> {
	id: I;
	target: T;
	source: Dictionary;
	meta?: ExperimentMeta;
}

export interface ExperimentMeta extends Dictionary {
	mods?: Dictionary<string | boolean>;
}

export type Experiments = Array<Experiment<ExperimentTarget, ExperimentId>>;
