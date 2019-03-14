/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface Event {
	event: Set<string>;
	cb: Function;
}

export default class EventEmitter {
	/**
	 * Listeners queue
	 */
	protected queue: Function[] = [];

	/**
	 * Event map
	 */
	protected events: Dictionary<Event[]> = {};

	/**
	 * Attaches a callback for the specified set of events
	 *
	 * @param event - set of events
	 * @param cb
	 */
	on(event: CanUndef<Set<string>>, cb: Function): void {
		if (event && event.size) {
			for (let v = event.values(), el = v.next(); !el.done; el = v.next()) {
				const
					key = el.value,
					queue = this.events[key] = this.events[key] || [];

				queue.push({event, cb});
			}

			return;
		}

		this.queue.push(cb);
	}

	/**
	 * Emits the specified event
	 * @param event
	 */
	emit(event: string): CanPromise<void> {
		const
			queue = this.events[event];

		if (!queue) {
			return;
		}

		const
			tasks = <CanPromise<unknown>[]>[];

		for (let i = 0; i < queue.length; i++) {
			const
				el = <Event>queue[i];

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
	 * Drains the listeners queue
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

/**
 * Creates a synchronous promise wrapper for the specified value
 *
 * @param resolveValue
 * @param rejectValue
 */
export function createSyncPromise<R = unknown>(resolveValue?: R, rejectValue?: unknown): Promise<R> {
	return <any>{
		then: (resolve, reject) => {
			try {
				if (rejectValue !== undefined) {
					return createSyncPromise(undefined, reject ? reject(rejectValue) : rejectValue);
				}

				return createSyncPromise(resolve ? resolve(resolveValue) : resolveValue);

			} catch (err) {
				return createSyncPromise(undefined, reject ? reject(err) : err);
			}
		},

		catch: (cb) => createSyncPromise(undefined, cb(rejectValue)),
		finally: (cb) => createSyncPromise(cb())
	};
}
