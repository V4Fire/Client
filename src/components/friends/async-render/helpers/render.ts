/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import SyncPromise from 'core/promise/sync';
import { queue } from 'core/component/render/daemon';

import type Friend from 'components/friends/friend';

import type { TaskOptions } from 'components/friends/async-render/interface';

/**
 * Adds a new render task to the global render queue and returns a promise.
 * The promise is resolved when the task is successfully completed.
 *
 * @param task - a function representing the render task to be executed
 * @param [opts] - additional options
 */
export function addRenderTask(
	this: Friend,
	task: Function,
	opts: TaskOptions = {}
): Promise<void> {
	const
		$a = this.async,
		group = (Object.isFunction(opts.group) ? opts.group() : opts.group) ?? 'asyncComponents';

	return new SyncPromise((resolve, reject) => {
		const taskDesc = {
			weight: opts.weight,
			task: $a.proxy(runTask, {
				group,
				single: false,
				onClear: (err) => {
					queue.delete(taskDesc);
					reject(err);
				}
			})
		};

		queue.add(taskDesc);

		function runTask() {
			const cb = () => {
				task();
				resolve();
				return true;
			};

			if (opts.useRAF) {
				return $a.animationFrame({group}).then(cb);
			}

			return cb();
		}
	});
}
