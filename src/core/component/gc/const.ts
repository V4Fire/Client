/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';

/**
 * Garbage collection daemon
 */
export const daemon = new Async();

/**
 * Destruction task queue
 */
export const queue: Array<Iterator<void>> = [];

/**
 * Task addition handlers queue
 */
export const onAdd: Function[] = [];

/**
 * Adds a task to the garbage collector queue
 * @param task
 */
export const add = (task: Iterator<void>): number => {
	const l = queue.push(task);

	onAdd.splice(0, onAdd.length).forEach((handler) => {
		handler();
	});

	return l;
};
