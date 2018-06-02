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
	DELAY = 40;

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
	renderStartTimer,
	renderStopTimer,
	loopTimer;

/**
 * Restarts render daemon
 */
export function restart(): void {
	isStarted = false;
	inProgress = false;
	render();
}

/**
 * Render loop
 */
function render(): void {
	clearImmediate(renderStopTimer);

	const
		cursor = queue.size ? queue : backQueue;

	const exec = () => {
		inProgress = isStarted = true;

		const
			time = Date.now();

		let
			done = COMPONENTS_PER_TICK;

		$C(cursor).forEach((fn, i, data, o) => {
			if (!done || Date.now() - time > DELAY) {
				return o.break;
			}

			if (fn()) {
				done--;
				cursor.delete(fn);
			}
		});

		const canProcessing = () =>
			Boolean(queue.size || backQueue.size);

		const runOnNextTick = () => {
			if (canProcessing()) {
				clearTimeout(loopTimer);
				loopTimer = setTimeout(render, DELAY);
				return true;
			}

			return false;
		};

		if (!runOnNextTick()) {
			renderStopTimer = setImmediate(() => {
				inProgress = isStarted = canProcessing();
				inProgress && runOnNextTick();
			});
		}
	};

	if (inProgress || cursor.size >= COMPONENTS_PER_TICK) {
		exec();

	} else {
		clearImmediate(renderStartTimer);
		renderStartTimer = setImmediate(exec);
	}
}
