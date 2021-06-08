/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import type { Task } from 'core/render/interface';

/**
 * The maximum number of tasks per one render iteration
 */
export const
	TASKS_PER_TICK = 5;

/**
 * Delay in milliseconds between render iterations
 */
export const
	DELAY = 40;

/**
 * Render queue
 */
export const queue = new Set<Task>();

/**
 * Render daemon
 */
export const daemon = new Async();

/**
 * Adds a task to the queue
 */
export const add = queue.add.bind(queue);
