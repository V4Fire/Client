/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/render/daemon/README.md]]
 * @packageDocumentation
 */

import config from 'config';

import { daemon, queue, add as addToQueue } from 'core/component/render/daemon/const';
import type { Task } from 'core/component/render/daemon/interface';

export * from 'core/component/render/daemon/const';
export * from 'core/component/render/daemon/interface';

const opts = config.asyncRender;

let
	inProgress = false,
	isStarted = false;

queue.add = function add(task: Task): typeof queue {
	addToQueue(task);

	if (!isStarted) {
		run();
	}

	return this;
};

/**
 * Restarts the rendering daemon
 */
export function restart(): void {
	isStarted = false;
	inProgress = false;
	run();
}

/**
 * Creates a task to restart the rendering daemon on the next tick
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
			done = opts.weightPerTick;

		for (const val of queue) {
			if (done <= 0 || Date.now() - time > opts.delay) {
				await daemon.idle({timeout: opts.delay});
				time = Date.now();

				// eslint-disable-next-line require-atomic-updates
				done = opts.weightPerTick;
			}

			const
				w = val.weight ?? 1;

			if (done - w < 0 && done !== opts.weightPerTick) {
				continue;
			}

			const canRender = val.task();

			const exec = (canRender: unknown) => {
				if (Object.isTruly(canRender)) {
					done -= val.weight ?? 1;
					queue.delete(val);
				}
			};

			if (Object.isPromise(canRender)) {
				const now = Date.now();
				await canRender.then(exec);

				if (now - time > opts.delay) {
					time = now;
					done += val.weight ?? 1;
				}

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

	if (inProgress || queue.size >= opts.weightPerTick) {
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
		daemon.requestIdleCallback(run, {timeout: opts.delay});
		return true;
	}

	return false;
}
