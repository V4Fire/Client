/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface TaskI<D = unknown> {
	list: Iterator<D>;
	i: number;
	total: number;
	chunk?: number;
}

export interface TaskFilter<EL = unknown, I extends number = number, D = unknown> {
	(): boolean;
	(el: EL, i: I, task: TaskI<D>): boolean;
}

export interface TaskDestructor {
	(el: Node);
}

export interface TaskOptions<EL = unknown, I extends number = number, D = unknown> {
	group?: string;
	weight?: number;
	filter?: TaskFilter<EL, I, D>;
	destructor?: TaskDestructor;
}

export interface TaskDesc {
	renderGroup?: string;
	destructor?: Function;
}
