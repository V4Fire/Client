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
 * @typeparam El - a data element to render
 * @typeparam D - a data collection to render
 */
export interface TaskOptions<El = unknown, D = unknown> {
	/**
	 * The weight of one render chunk.
	 * At the same tick can be rendered chunks with the accumulated weight no more than the `TASKS_PER_TICK` constant.
	 *
	 * @see core/component/render/daemon
	 */
	weight?: number;

	/**
	 * If true, then all rendered fragments are inserted into the DOM by using a `requestAnimationFrame` callback.
	 * This can optimize the browser rendering process.
	 *
	 * @default `false`
	 */
	useRAF?: boolean;

	/**
	 * A group name to manual clearing of pending tasks via the [[Async]] module.
	 * Providing this value disables automatically cleanup of render tasks on the `update` hook.
	 *
	 * @example
	 * ```
	 * < .container v-async-target
	 *   < .&__item v-for = el in asyncRender.iterate(100, 10, {group: 'listRendering'})
	 *     {{ el }}
	 *
	 * /// We should use a RegExp to clear tasks,
	 * /// because each group has a group based on a template `asyncComponents:listRendering:${chunkIndex}`.
	 * < button @click = async.clearAll({group: /:listRendering/})
	 *   Cancel rendering
	 * ```
	 */
	group?: string;

	/**
	 * A function to filter elements to render.
	 *
	 * If it returns a promise, the rendering process will wait for the promise to resolve.
	 * If the promise is resolved with `undefined`, the value will be interpreted as `true`.
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
	 * The destructor of a rendered fragment.
	 * It will be called before each asynchronously rendered fragment is removed from the DOM.
	 * If the function returns true, the internal destructor of the `asyncRender` module won’t be called.
	 */
	destructor?: NodeDestructor;
}

export interface TaskParams extends TaskOptions {
	renderGroup: string;
}

/**
 * An element of the render task
 */
export interface TaskEl<D = unknown> {
	/**
	 * The original structure that we iterate
	 */
	iterable: CanPromise<AnyIterable<D>>;

	/**
	 * Number of rendered tasks
	 */
	total: number;

	/**
	 * An index of the render chunk that own this operation
	 */
	chunk?: number;
}

/**
 * Additional options to render an iterable structure
 */
export interface IterOptions {
	/**
	 * A start index to iterate
	 */
	start?: number;

	/**
	 * How many fragments can be rendered at the same time
	 */
	perChunk?: number;

	/**
	 * A function to filter elements to render
	 */
	filter?: TaskFilter;
}

/**
 * A filter function for render tasks
 */
export interface TaskFilter<E = unknown, D = unknown> {
	(): CanPromise<boolean>;

	/**
	 * @param el - a data element to render
	 * @param i - an iteration index
	 * @param task - an element of the render task
	 */
	(el: E, i: number, task: TaskEl<D>): CanPromise<boolean>;
}

/**
 * A function to destroy the unmounted node
 */
export interface NodeDestructor {
	/**
	 * @param node - a node to remove
	 * @param childComponentEls - root elements of the child components
	 */
	(node: Node, childComponentEls: Element[]): AnyToBoolean;
}

/**
 * A descriptor of the iterable-based rendering structure
 */
export interface IterDescriptor {
	/**
	 * Is this iterator asynchronous or not
	 */
	isAsync: boolean;

	/**
	 * An index of the last synchronously read element for the first render
	 */
	readI: number;

	/**
	 * Number of synchronously read elements for the first render
	 */
	readTotal: number;

	/**
	 * An array of the synchronously read elements for the first render
	 */
	readEls: unknown[];

	/**
	 * The original structure that we iterate
	 */
	iterable: CanPromise<AnyIterable>;

	/**
	 * An iterator for the structure that we iterate
	 */
	iterator: AnyIterableIterator;
}
