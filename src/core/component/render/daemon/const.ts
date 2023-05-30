/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import type { Task } from 'core/component/render/daemon/interface';

/**
 * The rendering queue
 */
export const queue = new Set<Task>();

/**
 * The rendering daemon
 */
export const daemon = new Async();

/**
 * Adds a task to the rendering queue
 */
export const add = queue.add.bind(queue);
