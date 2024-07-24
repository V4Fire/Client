/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';

/**
 * Destruction task queue
 */
export const queue: Array<Iterator<void>> = [];

/**
 * Garbage collection daemon
 */
export const daemon = new Async();

/**
 * Adds a task to the garbage collector queue
 */
export const add = queue.push.bind(queue);
