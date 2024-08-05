/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import config from 'config';

import { daemon, queue, newTaskHandlersQueue } from 'core/component/gc/const';

/**
 * Returns a promise that resolves after a specified number of milliseconds set in the `config.gc.delay` option
 */
export function delay(): Promise<void> {
	return daemon.promise(new Promise<void>((resolve) => {
		if (queue.length === 0) {
			newTaskHandlersQueue.push(() => delay().then(resolve));
			return;
		}

		if (typeof requestIdleCallback === 'function') {
			requestIdleCallback(() => {
				resolve();
			}, {timeout: config.gc.delay});

		} else {
			setTimeout(() => {
				resolve();

			// To avoid freezing during cleaning of a larger number of components at once,
			// a little randomness is added to the process
			}, config.gc.delay - Math.floor(Math.random() * (config.gc.delay / 3)));
		}
	}));
}
