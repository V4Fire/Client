/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import $C = require('collection.js');

export const
	DELAY = 50;

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
let i = 0;
function render(): void {
	const
		cursor = queue.size ? queue : backQueue,
		componentsPerTick = 10,
		switchI = Math.round(componentsPerTick / 2) + 1;

	const exec = () => {
		inProgress = true;

		let
			done = componentsPerTick;

		$C(cursor).forEach((fn, i, data, o) => {
			if (!done) {
				return o.break;
			}

			if (fn()) {
				done--;
				cursor.delete(fn);
			}

		}, {reverse: i % switchI === 0});

		i++;
		if (i === switchI) {
			i = 0;
		}

		if (queue.size || backQueue.size) {
			setTimeout(() => requestIdleCallback(render), DELAY);

		} else {
			setImmediate(() => {
				inProgress = false;
			});
		}
	};

	if (cursor.size >= componentsPerTick) {
		exec();

	} else {
		clearImmediate(timer);
		timer = setImmediate(exec);
	}
}
