/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import log from 'core/log';
import { ComponentMeta } from 'core/component/interface';

/**
 * Runs a hook from the specified meta object
 *
 * @param hook
 * @param meta
 * @param ctx - component context
 * @param args - event arguments
 */
export function runHook(
	hook: string,
	meta: ComponentMeta,
	ctx: Dictionary<any>,
	...args: unknown[]
): Promise<void> {
	ctx.hook = hook;

	if (Object.isFunction(ctx.log)) {
		ctx.log(`hook:${hook}`, ...args);

	} else {
		log(`component:hook:${meta.componentName}:${hook}`, ...args, ctx);
	}

	if (!meta.hooks[hook].length) {
		return createSyncPromise();
	}

	const
		event = new HookEmitter();

	for (let hooks = meta.hooks[hook], i = 0; i < hooks.length; i++) {
		const
			hook = hooks[i];

		event.on(hook.after, () => {
			const
				res = hook.fn.apply(ctx, args),
				emit = () => event.emit(hook.name || Math.random().toString());

			if (Object.isPromise(res)) {
				return res.then(emit);
			}

			const
				tasks = emit();

			if (Object.isPromise(tasks)) {
				return tasks;
			}
		});
	}

	const
		tasks = event.fire();

	if (Object.isPromise(tasks)) {
		return tasks;
	}

	return createSyncPromise();
}

interface HookEvent {
	event: Set<string>;
	cb: Function;
}

class HookEmitter {
	queue: Function[] = [];
	events: Dictionary<HookEvent[]> = {};

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

	emit(event: string): CanPromise<void> {
		if (!this.events[event]) {
			return;
		}

		const
			tasks = <CanPromise<unknown>[]>[],
			queue = this.events[event];

		if (!queue) {
			return;
		}

		for (let i = 0; i < queue.length; i++) {
			const
				el = <HookEvent>queue[i];

			if (el) {
				const ev = el.event;
				ev.delete(event);

				if (!ev.size) {
					const
						task = el.cb();

					if (Object.isPromise(task)) {
						tasks.push(task);
					}
				}
			}
		}

		if (tasks.length) {
			return Promise.all(tasks).then(() => undefined);
		}
	}

	fire(): CanPromise<void> {
		const
			tasks = <Promise<unknown>[]>[];

		for (let i = 0; i < this.queue.length; i++) {
			const
				task = this.queue[i]();

			if (Object.isPromise(task)) {
				tasks.push(task);
			}
		}

		if (tasks.length) {
			return Promise.all(tasks).then(() => undefined);
		}
	}
}

function createSyncPromise<R = unknown>(val?: R, err?: unknown): Promise<R> {
	return <any>{
		then: (resolve, reject) => {
			try {
				if (err !== undefined) {
					return createSyncPromise(undefined, reject ? reject(err) : err);
				}

				return createSyncPromise(resolve ? resolve(val) : val);

			} catch (err) {
				return createSyncPromise(undefined, reject ? reject(err) : err);
			}
		},

		catch: (cb) => createSyncPromise(undefined, cb(err)),
		finally: (cb) => createSyncPromise(cb())
	};
}
