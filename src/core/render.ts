/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';

const
	COMPONENTS_PER_TICK = 10,
	DELAY = 40;

export const
	queue = new Set(),
	backQueue = new Set(),
	add = queue.add,
	daemon = new Async();

let
	inProgress = false,
	isStarted = false;

queue.add = backQueue.add = function addToQueue<T = unknown>(): T {
	const
		res = add.apply(this, arguments);

	if (!isStarted) {
		run();
	}

	return res;
};

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
export function deferRestart(): void {
	isStarted = inProgress = false;
	daemon.clearAll();
	runOnNextTick();
}

function run(): void {
	daemon.clearAll();

	const
		cursor = queue.size ? queue : backQueue;

	const exec = async () => {
		inProgress = isStarted = true;

		let
			time = Date.now(),
			done = COMPONENTS_PER_TICK;

		for (let w = cursor.values(), el = w.next(); !el.done; el = w.next()) {
			const
				val = el.value;

			if (done <= 0 || Date.now() - time > DELAY) {
				await daemon.sleep(DELAY);
				time = Date.now();
				done = COMPONENTS_PER_TICK;
			}

			const
				w = val.weight || 1;

			if (done - w < 0 && done !== COMPONENTS_PER_TICK) {
				continue;
			}

			if (val.fn()) {
				done -= val.weight || 1;
				cursor.delete(el);
			}
		}

		if (!runOnNextTick()) {
			daemon.setImmediate(() => {
				inProgress = isStarted = canProcessing();
				inProgress && runOnNextTick();
			});
		}
	};

	if (inProgress || cursor.size >= COMPONENTS_PER_TICK) {
		exec().catch(stderr);

	} else {
		daemon.setImmediate(() => exec().catch(stderr));
	}
}

function canProcessing(): boolean {
	return Boolean(queue.size || backQueue.size);
}

function runOnNextTick(): boolean {
	if (canProcessing()) {
		daemon.setTimeout(run, DELAY);
		return true;
	}

	return false;
}
