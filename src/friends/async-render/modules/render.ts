/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import SyncPromise from 'core/promise/sync';
import { queue } from 'core/component/render/daemon';

import type iBlock from 'super/i-block/i-block';
import type { ComponentElement } from 'super/i-block/i-block';

import type AsyncRender from 'friends/async-render/class';
import type { TaskOptions } from 'friends/async-render/interface';

/**
 * Adds a new render task to the global render queue and returns a promise.
 * The promise will be resolved when the added task is completed.
 *
 * @param task - a task function to execute
 * @param [opts] - additional options
 */
export function addRenderTask(
	this: AsyncRender,
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
export function destroyNode(this: AsyncRender, node: Node, childComponentEls: Element[] = []): void {
	node.parentNode?.removeChild(node);

	for (let i = 0; i < childComponentEls.length; i++) {
		const
			el = childComponentEls[i];

		try {
			(<ComponentElement<iBlock>>el).component?.unsafe.$destroy();

		} catch (err) {
			stderr(err);
		}
	}

	try {
		(<ComponentElement<iBlock>>node).component?.unsafe.$destroy();

	} catch (err) {
		stderr(err);
	}
}
