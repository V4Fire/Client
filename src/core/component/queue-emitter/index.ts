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

import { EventListener } from 'core/component/queue-emitter/interface';
export * from 'core/component/queue-emitter/interface';

/**
 * Special kind of an event emitter that supports queues of events
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
	 * The callback will invoked only when all specified events was emitted.
	 *
	 * @param event - set of events (can be undefined)
	 * @param cb
	 */
	on(event: CanUndef<Set<string>>, cb: Function): void {
		if (event && event.size) {
			for (let v = event.values(), el = v.next(); !el.done; el = v.next()) {
				const
					key = el.value,
					queue = this.listeners[key] = this.listeners[key] || [];

				queue.push({event, cb});
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
			tasks = <CanPromise<unknown>[]>[];

		for (let i = 0; i < queue.length; i++) {
			const
				el = <EventListener>queue[i];

			if (el) {
				const ev = el.event;
				ev.delete(event);

				if (!ev.size) {
					const
						task = el.cb();

					if (task instanceof Promise) {
						tasks.push(task);
					}
				}
			}
		}

		if (tasks.length) {
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
			tasks = <Promise<unknown>[]>[];

		for (let i = 0; i < queue.length; i++) {
			const
				task = queue[i]();

			if (task instanceof Promise) {
				tasks.push(task);
			}
		}

		if (tasks.length) {
			return Promise.all(tasks).then(() => undefined);
		}
	}
}
