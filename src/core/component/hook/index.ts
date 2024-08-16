/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/hook/README.md]]
 * @packageDocumentation
 */

import SyncPromise from 'core/promise/sync';
import QueueEmitter from 'core/component/queue-emitter';

import type { Hook, ComponentHook, ComponentInterface } from 'core/component/interface';

/**
 * Runs a hook on the specified component instance.
 * The function returns a promise resolved when all hook handlers are executed.
 *
 * @param hook - the hook name to run
 * @param component - the tied component instance
 * @param args - the hook arguments
 *
 * @example
 * ```js
 * runHook('beforeCreate', component).then(() => console.log('Done!'));
 * ```
 */
export function runHook(hook: Hook, component: ComponentInterface, ...args: unknown[]): Promise<void> {
	const unsafe = Object.cast<Writable<ComponentInterface['unsafe']>>(
		component
	);

	if (unsafe.hook === hook) {
		return SyncPromise.resolve();
	}

	unsafe.hook = hook;

	const
		m = component.unsafe.meta,
		hooks: ComponentHook[] = [];

	if (`before:${hook}` in m.hooks) {
		hooks.push(...m.hooks[`before:${hook}`]);
	}

	hooks.push(...m.hooks[hook]);

	if (`after:${hook}` in m.hooks) {
		hooks.push(...m.hooks[`after:${hook}`]);
	}

	switch (hooks.length) {
		case 0:
			break;

		case 1: {
			const
				hook = hooks[0],
				res = args.length > 0 ? hook.fn.apply(component, args) : hook.fn.call(component);

			if (hook.once) {
				hooks.pop();
			}

			if (Object.isPromise(res)) {
				return res.then(() => undefined);
			}

			break;
		}

		default: {
			if (hooks.some((hook) => hook.after != null && hook.after.size > 0)) {
				const
					emitter = new QueueEmitter(),
					filteredHooks: ComponentHook[] = [];

				hooks.forEach((hook) => {
					const nm = hook.name;

					if (!hook.once) {
						filteredHooks.push(hook);
					}

					emitter.on(hook.after, () => {
						const res = args.length > 0 ? hook.fn.apply(component, args) : hook.fn.call(component);

						if (Object.isPromise(res)) {
							return res.then(() => nm != null ? emitter.emit(nm) : undefined);
						}

						const tasks = nm != null ? emitter.emit(nm) : null;

						if (tasks != null) {
							return tasks;
						}
					});
				});

				m.hooks[hook] = filteredHooks;

				const tasks = emitter.drain();

				if (Object.isPromise(tasks)) {
					return tasks;
				}

			} else {
				const tasks: Array<Promise<unknown>> = [];

				hooks.slice().forEach((hook) => {
					const res = args.length > 0 ? hook.fn.apply(component, args) : hook.fn.call(component);

					if (hook.once) {
						hooks.pop();
					}

					if (Object.isPromise(res)) {
						tasks.push(res);
					}
				});

				if (tasks.length > 0) {
					return Promise.all(tasks).then(() => undefined);
				}
			}
		}
	}

	return SyncPromise.resolve();
}
