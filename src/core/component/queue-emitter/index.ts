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

import type { EventListener } from 'core/component/queue-emitter/interface';

export * from 'core/component/queue-emitter/interface';

/**
 * The special kind of event emitter that supports queues of handlers
 */
export default class QueueEmitter {
	/**
	 * A queue of event handlers that are ready to invoke
	 */
	protected queue: Function[] = [];

	/**
	 * A dictionary with tied event listeners that aren't ready to invoke
	 */
	protected listeners: Dictionary<EventListener[]> = Object.createDict();

	/**
	 * Attaches a handler for the specified set of events.
	 * The handler will be invoked only when all specified events are fired.
	 *
	 * @param event - a set of events (can be undefined)
	 * @param handler
	 */
	on(event: Nullable<Set<string>>, handler: Function): void {
		if (event != null && event.size > 0) {
			for (let o = event.values(), el = o.next(); !el.done; el = o.next()) {
				const
					key = el.value,
					listeners = this.listeners[key] ?? [];

				listeners.push({event, handler});
				this.listeners[key] = listeners;
			}

			return;
		}

		this.queue.push(handler);
	}

	/**
	 * Emits the specified event.
	 * If at least one of handlers returns a promise,
	 * the method returns a promise that will be resolved after all internal promises are resolved.
	 *
	 * @param event
	 */
	emit(event: string): CanPromise<void> {
		const
			queue = this.listeners[event];

		if (queue == null) {
			return;
		}

		const
			tasks: Array<CanPromise<unknown>> = [];

		for (let i = 0; i < queue.length; i++) {
			const
				el = queue[i];

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (el != null) {
				const ev = el.event;
				ev.delete(event);

				if (ev.size === 0) {
					const
						task = el.handler();

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
	 * Drains the queue of handlers that are ready to invoke.
	 * If at least one of listeners returns a promise,
	 * the method returns a promise that will be resolved after all internal promises are resolved.
	 */
	drain(): CanPromise<void> {
		const
			{queue} = this;

		const
			tasks: Array<Promise<unknown>> = [];

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
