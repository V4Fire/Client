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
		run();
	}

	return res;
};

let
	daemonStartTimer,
	daemonStopTimer,
	loopTimer;

/**
 * Restarts render daemon
 */
export function restart(): void {
	isStarted = inProgress = false;
	run();
}

/**
 * Restarts render daemon (runs on the next tick)
 */
export function lazyRestart(): void {
	isStarted = inProgress = false;
	clearTimers();
	runOnNextTick();
}

function run(): void {
	clearTimers();

	const
		cursor = queue.size ? queue : backQueue;

	const exec = () => {
		inProgress = isStarted = true;

		const
			time = Date.now();

		let
			done = COMPONENTS_PER_TICK;

		$C(cursor).forEach((el, i, data, o) => {
			if (done <= 0 || Date.now() - time > DELAY) {
				return o.break;
			}

			const
				w = el.weight || 1;

			if (done - w < 0 && done !== COMPONENTS_PER_TICK) {
				return;
			}

			if (el.fn()) {
				done -= el.weight || 1;
				cursor.delete(el);
			}
		});

		if (!runOnNextTick()) {
			daemonStopTimer = setImmediate(() => {
				inProgress = isStarted = canProcessing();
				inProgress && runOnNextTick();
			});
		}
	};

	if (inProgress || cursor.size >= COMPONENTS_PER_TICK) {
		exec();

	} else {
		daemonStartTimer = setImmediate(exec);
	}
}

function canProcessing(): boolean {
	return Boolean(queue.size || backQueue.size);
}

function runOnNextTick(): boolean {
	if (canProcessing()) {
		loopTimer = setTimeout(run, DELAY);
		return true;
	}

	return false;
}

function clearTimers(): void {
	clearImmediate(daemonStartTimer);
	clearImmediate(daemonStopTimer);
	clearTimeout(loopTimer);
}
