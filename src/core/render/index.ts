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

import {

	daemon,
	queue,
	add as addToQueue,

	TASKS_PER_TICK,
	DELAY

} from 'core/render/const';

export * from 'core/render/const';
export * from 'core/render/interface';

let
	inProgress = false,
	isStarted = false;

queue.add = function add<T = unknown>(...args: unknown[]): T {
	const
		res = addToQueue(...args);

	if (!isStarted) {
		run();
	}

	return res;
};

/**
 * Restarts the render daemon
 */
export function restart(): void {
	isStarted = false;
	inProgress = false;
	run();
}

/**
 * Restarts the render daemon
 * (it runs on the next tick)
 */
export function deferRestart(): void {
	isStarted = false;
	inProgress = false;
	daemon.clearAll();
	runOnNextTick();
}

function run(): void {
	daemon.clearAll();

	const exec = async () => {
		inProgress = true;
		isStarted = true;

		let
			time = Date.now(),
			done = TASKS_PER_TICK;

		for (let w = queue.values(), el = w.next(); !el.done; el = w.next()) {
			const
				val = el.value;

			if (done <= 0 || Date.now() - time > DELAY) {
				await daemon.sleep(DELAY);
				time = Date.now();

				// eslint-disable-next-line require-atomic-updates
				done = TASKS_PER_TICK;
			}

			const
				w = val.weight ?? 1;

			if (done - w < 0 && done !== TASKS_PER_TICK) {
				continue;
			}

			const
				canRender = val.fn();

			const exec = (canRender) => {
				if (Object.isTruly(canRender)) {
					done -= val.weight ?? 1;
					queue.delete(val);
				}
			};

			if (Object.isPromise(canRender)) {
				await canRender.then(exec);

			} else {
				exec(canRender);
			}
		}

		if (!runOnNextTick()) {
			daemon.setImmediate(() => {
				inProgress = canProcessing();
				isStarted = inProgress;

				if (inProgress) {
					runOnNextTick();
				}
			});
		}
	};

	if (inProgress || queue.size >= TASKS_PER_TICK) {
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
