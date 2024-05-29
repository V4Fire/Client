/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { TaskFilter } from 'components/friends/async-render/interface/task';

/**
 * Additional options to control the rendering process of an iterable structure
 */
export interface IterOptions {
	/**
	 * The index at which to start iteration for rendering.
	 * This allows for partial rendering of iterable, starting at a specific point.
	 */
	start?: number;

	/**
	 * The maximum number of fragments that are allowed to be rendered simultaneously.
	 * This helps manage rendering workload and optimize performance, especially useful in large datasets.
	 */
	perChunk?: number;

	/**
	 * An optional filter function that determines which elements of the iterable should be rendered.
	 * This can be used to apply conditional rendering or exclude certain elements based on custom logic.
	 */
	filter?: TaskFilter;
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
	 * The index of the last element that was synchronously read during the initial rendering phase
	 */
	readI: number;

	/**
	 * The total number of elements read synchronously for the initial render
	 */
	readTotal: number;

	/**
	 * Stores the elements synchronously read during the initial rendering phase
	 */
	readEls: unknown[];

	/**
	 * The original structure over which iteration occurs.
	 * Can be a promise that resolves an iterable data structure.
	 */
	iterable: CanPromise<AnyIterable>;

	/**
	 * An iterator for the structure that we iterate
	 */
	iterator: AnyIterableIterator;
}
