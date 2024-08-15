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

export default class QueueEmitter {
	/**
	 * A queue of event handlers that are ready to be executed
	 */
	protected queue: Function[] = [];

	/**
	 * A dictionary containing event listeners that are tied to specific events but are not yet ready to be executed
	 */
	protected listeners: Dictionary<EventListener[]> = Object.createDict();

	/**
	 * Attaches a handler function for the specified set of events.
	 * The handler function will only be invoked once all specified events have been fired.
	 *
	 * @param event - the set of events (can be undefined)
	 * @param handler
	 */
	on(event: Nullable<Set<string>>, handler: Function): void {
		if (event != null && event.size > 0) {
			event.forEach((name) => {
				const listeners = this.listeners[name] ?? [];
				listeners.push({event, handler});
				this.listeners[name] = listeners;
			});

			return;
		}

		this.queue.push(handler);
	}

	/**
	 * Emits the specified event, invoking all handlers attached to the event.
	 * If at least one of the handlers returns a promise,
	 * the method will return a promise that will only be resolved once all internal promises are resolved.
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

		queue.forEach((el) => {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (el == null) {
				return;
			}

			const ev = el.event;
			ev.delete(event);

			if (ev.size === 0) {
				const task = el.handler();

				if (Object.isPromise(task)) {
					tasks.push(task);
				}
			}
		});

		if (tasks.length > 0) {
			return Promise.all(tasks).then(() => undefined);
		}
	}

	/**
	 * Drains the queue of event handlers that are ready to be executed.
	 * If at least one of the handlers returns a promise,
	 * the method will return a promise that will only be resolved once all internal promises are resolved.
	 */
	drain(): CanPromise<void> {
		const {queue} = this;

		const tasks: Array<Promise<unknown>> = [];

		queue.forEach((el) => {
			const
				task = el();

			if (Object.isPromise(task)) {
				tasks.push(task);
			}
		});

		if (tasks.length > 0) {
			return Promise.all(tasks).then(() => undefined);
		}
	}
}
