/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import $C = require('collection.js');

const
	COMPONENTS_PER_TICK = 10,
	DELAY = 30;

/**
 * Render queue
 */
export const
	queue = new Set(),
	backQueue = new Set(),
	add = queue.add;

let
	inProgress = false,
	isStarted = false;

queue.add = backQueue.add = function addToQueue<T>(): T {
	const
		res = add.apply(this, arguments);

	if (!isStarted) {
		render();
	}

	return res;
};

let
	renderStartTimer;

/**
 * Render loop
 */
function render(): void {
	const
		cursor = queue.size ? queue : backQueue;

	const exec = () => {
		inProgress = true;
		isStarted = true;

		const
			time = Date.now();

		let
			done = COMPONENTS_PER_TICK;

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
			setTimeout(render, DELAY);

		} else {
			inProgress = false;
			isStarted = false;
		}
	};

	if (inProgress || cursor.size >= COMPONENTS_PER_TICK) {
		exec();

	} else {
		clearImmediate(renderStartTimer);
		renderStartTimer = setImmediate(exec);
	}
}
