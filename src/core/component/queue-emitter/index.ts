/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/queue-emitter/README.md]]
 * @packageDocumentation
 */

import type { EventListener } from '~/core/component/queue-emitter/interface';

export * from '~/core/component/queue-emitter/interface';

/**
 * The special kind of event emitter that supports queues of events
 */
export default class QueueEmitter {
	/**
	 * Queue of event listeners that is ready to fire
	 */
	protected queue: Function[] = [];

	/**
	 * Map of tied event listeners that isn't ready to fire
	 */
	protected listeners: Dictionary<EventListener[]> = Object.createDict();

	/**
	 * Attaches a callback for the specified set of events.
	 * The callback will be invoked only when all specified events was emitted.
	 *
	 * @param event - set of events (can be undefined)
	 * @param cb
	 */
	on(event: Nullable<Set<string>>, cb: Function): void {
		if (event != null && event.size > 0) {
			for (let v = event.values(), el = v.next(); !el.done; el = v.next()) {
				const key = el.value;
				this.listeners[key] = this.listeners[key] ?? [];
				this.listeners[key]!.push({event, cb});
			}

			return;
		}

		this.queue.push(cb);
	}

	/**
	 * Emits the specified event.
	 * If at least one of listeners returns a promise,
	 * the method returns promise that is resolved after all internal promises are resolved.
	 *
	 * @param event
	 */
	emit(event: string): CanPromise<void> {
		const
			queue = this.listeners[event];

		if (!queue) {
			return;
		}

		const
			tasks = <Array<CanPromise<unknown>>>[];

		for (let i = 0; i < queue.length; i++) {
			const
				el = queue[i];

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (el != null) {
				const ev = el.event;
				ev.delete(event);

				if (ev.size === 0) {
					const
						task = el.cb();

					if (Object.isPromise(task)) {
						tasks.push(task);
					}
				}
			}
		}

		if (tasks.length > 0) {
			return Promise.all(tasks).then(() => undefined);
		}
	}

	/**
	 * Drains the queue of listeners that is ready to fire.
	 * If at least one of listeners returns a promise,
	 * the method returns promise that is resolved after all internal promises are resolved.
	 */
	drain(): CanPromise<void> {
		const
			{queue} = this;

		const
			tasks = <Array<Promise<unknown>>>[];

		for (let i = 0; i < queue.length; i++) {
			const
				task = queue[i]();

			if (Object.isPromise(task)) {
				tasks.push(task);
			}
		}

		if (tasks.length > 0) {
			return Promise.all(tasks).then(() => undefined);
		}
	}
}
