/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/render/README.md]]
 * @packageDocumentation
 */

import { daemon, queue, add, COMPONENTS_PER_TICK, DELAY } from 'core/render/const';
export * from 'core/render/const';
export * from 'core/render/interface';

let
	inProgress = false,
	isStarted = false;

queue.add = function addToQueue<T = unknown>(): T {
	const
		res = add.apply(this, arguments);

	if (!isStarted) {
		run();
	}

	return res;
};

/**
 * Restarts the render daemon
 */
export function restart(): void {
	isStarted = inProgress = false;
	run();
}

/**
 * Restarts the render daemon
 * (it runs on the next tick)
 */
export function deferRestart(): void {
	isStarted = inProgress = false;
	daemon.clearAll();
	runOnNextTick();
}

function run(): void {
	daemon.clearAll();

	const exec = async () => {
		inProgress = isStarted = true;

		let
			time = Date.now(),
			done = COMPONENTS_PER_TICK;

		for (let w = queue.values(), el = w.next(); !el.done; el = w.next()) {
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
				queue.delete(val);
			}
		}

		if (!runOnNextTick()) {
			daemon.setImmediate(() => {
				inProgress = isStarted = canProcessing();
				inProgress && runOnNextTick();
			});
		}
	};

	if (inProgress || queue.size >= COMPONENTS_PER_TICK) {
		exec().catch(stderr);

	} else {
		daemon.setImmediate(() => exec().catch(stderr));
	}
}

function canProcessing(): boolean {
	return Boolean(queue.size);
}

function runOnNextTick(): boolean {
	if (canProcessing()) {
		daemon.setTimeout(run, DELAY);
		return true;
	}

	return false;
}
