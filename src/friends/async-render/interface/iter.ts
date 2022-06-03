/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { TaskFilter } from 'friends/async-render/interface/task';

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
