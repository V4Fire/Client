/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Additional options for a render task
 *
 * @typeParam El - a data element that is being rendered
 * @typeParam D - the entire collection of data elements that the render task processes
 */
export interface TaskOptions<El = unknown, D = unknown> {
	/**
	 * The weight of a single render chunk determines its processing cost.
	 * During the same tick, only chunks with a combined weight that does not exceed
	 * the `TASKS_PER_TICK` constant can be rendered.
	 *
	 * @see core/component/render/daemon
	 */
	weight?: number;

	/**
	 * If set to true, then all rendered fragments are inserted into the DOM by using a `requestAnimationFrame` callback.
	 * This can optimize the browser rendering process.
	 *
	 * @default `false`
	 */
	useRAF?: boolean;

	/**
	 * A group name for manually clearing pending tasks via the [[Async]] module.
	 * Setting this value disables the automatic cleanup of render tasks during the update hook.
	 * If this parameter is provided as a function, the group name will be dynamically calculated in each iteration.
	 *
	 * @example
	 * ```
	 * < .container v-async-target
	 *   < .&__item v-for = el in asyncRender.iterate(100, 10, {group: 'listRendering'})
	 *     {{ el }}
	 *
	 * /// We should use a RegExp to clear tasks
	 * /// because each group is named based on a template like `asyncComponents:listRendering:${chunkIndex}`
	 * < button @click = async.clearAll({group: /:listRendering/})
	 *   Cancel rendering
	 * ```
	 */
	group?: string | (() => string);

	/**
	 * A function to filter elements for rendering.
	 * If it returns a promise, the rendering process will pause until the promise resolves.
	 * Should the promise resolve with `undefined`, the value will be interpreted as `true`.
	 *
	 * @example
	 * ```
	 * < .container v-async-target
	 *   /// Render only even values
	 *   < .&__item v-for = el in asyncRender.iterate(100, 5, {filter: (el) => el % 2 === 0})
	 *     {{ el }}
	 *
	 * < .container v-async-target
	 *   /// Render each element with the specified delay
	 *   < .&__item v-for = el in asyncRender.iterate(100, {filter: (el) => async.sleep(100)})
	 *     {{ el }}
	 *
	 * < .container v-async-target
	 *   /// Render each element after the specified event
	 *   < .&__item v-for = el in asyncRender.iterate(100, 20, {filter: (el) => promisifyOnce('renderNextChunk')})
	 *     {{ el }}
	 *
	 * < button @click = emit('renderNextChunk')
	 *   Render the next chunk
	 * ```
	 */
	filter?: TaskFilter<El, D>;

	/**
	 * The destructor for a rendered fragment is invoked before each asynchronously rendered fragment is
	 * removed from the DOM.
	 * If this function returns true, the internal destructor of the asyncRender module will not be executed.
	 */
	destructor?: NodeDestructor;
}

export interface TaskParams extends TaskOptions {
	renderGroup: string;
}

export interface TaskEl<D = unknown> {
	/**
	 * The original structure over which iteration occurs.
	 * Can be a promise that resolves an iterable data structure.
	 */
	iterable: CanPromise<AnyIterable<D>>;

	/**
	 * The total number of tasks that have been rendered
	 */
	total: number;

	/**
	 * The index of the render chunk that owns this task.
	 * This property is optional and used to identify specific chunks.
	 */
	chunk?: number;
}

export interface TaskFilter<E = unknown, D = unknown> {
	(): CanPromise<boolean>;

	/**
	 * A filter function for render tasks
	 *
	 * @param el - a data element to render
	 * @param i - an iteration index
	 * @param task - an element of the render task
	 */
	(el: E, i: number, task: TaskEl<D>): CanPromise<boolean>;
}

export interface NodeDestructor {
	/**
	 * A function for destroying the unmounted node
	 *
	 * @param node - the node to be removed
	 * @param childComponentEls - an array of root elements from any child components within the node
	 */
	(node: Node, childComponentEls: Element[]): AnyToBoolean;
}
