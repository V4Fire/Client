/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Async from 'core/async';

export interface TaskI<D = unknown> {
	iterable: Iterable<D>;
	i: number;
	total: number;
	chunk?: number;
}

export interface TaskFilter<EL = unknown, I extends number = number, D = unknown> {
	(): CanPromise<boolean>;
	(el: EL, i: I, task: TaskI<D>): CanPromise<boolean>;
}

export interface ElementDestructor {
	(el: Node): any;
}

export interface TaskParams<EL = unknown, I extends number = number, D = unknown> {
	/**
	 * If true, then rendered chunks are inserted into DOM on the `requestAnimationFrame` callback.
	 * It may optimize the process of browser rendering.
	 *
	 * @default `false`
	 */
	useRAF?: boolean;

	/**
	 * A group name to manual clearing of pending tasks via `async`.
	 * Providing this value disables automatically canceling of rendering task on the `update` hook.
	 *
	 * @example
	 * ```
	 * /// Iterate over only even values
	 * < .bla v-for = el in asyncRender.iterate(100, 10, {group: 'listRendering'})
	 *   {{ el }}
	 *
	 * /// Notice that we use RegExp to clear tasks.
	 * /// Because each group has a group based on a template `asyncComponents:listRendering:${chunkIndex}`.
	 * < button @click = async.clearAll({group: /:listRendering/})
	 *   Cancel rendering
	 * ```
	 */
	group?: string;

	/**
	 * Weight of the one rendering chunk.
	 * In the one tick can be rendered chunks with accumulated weight no more than 5.
	 */
	weight?: number;

	/**
	 * A function to filter elements to iterate. If it returns a promise, the rendering will wait for resolving.
	 * If the promise' value is equal to `undefined`, it will cast to `true`.
	 *
	 * @example
	 * ```
	 * /// Iterate over only even values
	 * < .bla v-for = el in asyncRender.iterate(100, 5, {filter: (el) => el % 2 === 0})
	 *   {{ el }}
	 *
	 * /// Render each element only after the previous with the specified delay
	 * < .bla v-for = el in asyncRender.iterate(100, {filter: (el) => async.sleep(100)})
	 *   {{ el }}
	 *
	 * /// Render a chunk on the specified event
	 * < .bla v-for = el in asyncRender.iterate(100, 20, {filter: (el) => promisifyOnce('renderNextChunk')})
	 *   {{ el }}
	 *
	 * < button @click = emit('renderNextChunk')
	 *   Render the next chunk
	 * ```
	 */
	filter?: TaskFilter<EL, I, D>;

	/**
	 * The destructor of the rendered element.
	 * It will be invoked before removing each async rendered element from DOM.
	 */
	destructor?: ElementDestructor;
}

export interface TaskDesc {
	async: Async<any>;
	renderGroup: string;
}
