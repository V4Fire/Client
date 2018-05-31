/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import $C = require('collection.js');

/**
 * Render queue
 */
export const
	queue = new Set(),
	backQueue = new Set(),
	add = queue.add;

let
	inProgress = false,
	timer;

queue.add = backQueue.add = function addToQueue<T>(): T {
	const
		res = add.apply(this, arguments);

	if (!inProgress) {
		render();
	}

	return res;
};

/**
 * Render loop
 */
function render(): void {
	const
		cursor = queue.size ? queue : backQueue,
		componentsPerTick = 10;

	const exec = () => {
		inProgress = true;

		const
			time = Date.now();

		let
			done = componentsPerTick;

		$C(cursor).forEach((fn, i, data, o) => {
			if (!done || Date.now() - time > 30) {
				return o.break;
			}

			if (fn()) {
				done--;
				cursor.delete(fn);
			}
		});

		if (queue.size || backQueue.size) {
			requestIdleCallback(render);

		} else {
			setImmediate(() => inProgress = false);
		}
	};

	if (!inProgress) {
		if (cursor.size >= componentsPerTick) {
			exec();

		} else {
			clearImmediate(timer);
			timer = setImmediate(exec);
		}
	}
}
