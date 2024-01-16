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

import type iBlock from 'components/super/i-block/i-block';
import type { ComponentElement } from 'components/super/i-block/i-block';

import type { TaskOptions } from 'components/friends/async-render/interface';

/**
 * Adds a new render task to the global render queue and returns a promise.
 * The promise will be resolved when the added task is completed.
 *
 * @param task - a task function to execute
 * @param [opts] - additional options
 */
export function addRenderTask(
	this: Friend,
	task: Function,
	opts: TaskOptions = {}
): Promise<void> {
	const
		$a = this.async,
		group = opts.group ?? 'asyncComponents';

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

/**
 * Removes the given node from the DOM tree and destroys all tied components
 *
 * @param node - a node to remove
 * @param [childComponentEls] - root elements of the child components
 */
export function destroyNode(this: Friend, node: Node, childComponentEls: Element[] = []): void {
	childComponentEls.forEach((child) => {
		try {
			(<ComponentElement<iBlock>>child).component?.unsafe.$destroy();

		} catch (err) {
			stderr(err);
		}
	});

	try {
		(<ComponentElement<iBlock>>node).component?.unsafe.$destroy();

	} catch (err) {
		stderr(err);
	}

	node.parentNode?.removeChild(node);
}
