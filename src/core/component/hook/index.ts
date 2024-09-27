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

	const {meta} = component.unsafe;

	const hooks: ComponentHook[] = [];

	if (hook === 'created' || hook === 'updated' || hook === 'mounted') {
		hooks.push(...meta.hooks[`before:${hook}`]);
	}

	hooks.push(...meta.hooks[hook]);

	if (hook === 'beforeDataCreate') {
		hooks.push(...meta.hooks[`after:${hook}`]);
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
			let toDelete: CanNull<number[]> = null;

			if (hooks.some((hook) => hook.after != null && hook.after.size > 0)) {
				const emitter = new QueueEmitter();

				hooks.forEach((hook, i) => {
					const hookName = hook.name;

					if (hook.once) {
						toDelete ??= [];
						toDelete.push(i);
					}

					emitter.on(hook.after, () => {
						const res = args.length > 0 ? hook.fn.apply(component, args) : hook.fn.call(component);

						if (Object.isPromise(res)) {
							return res.then(() => hookName != null ? emitter.emit(hookName) : undefined);
						}

						const tasks = hookName != null ? emitter.emit(hookName) : null;

						if (tasks != null) {
							return tasks;
						}
					});
				});

				removeFromHooks(toDelete);

				const tasks = emitter.drain();

				if (Object.isPromise(tasks)) {
					return tasks;
				}

			} else {
				let tasks: CanNull<Array<Promise<unknown>>> = null;

				hooks.forEach((hook, i) => {
					let res: unknown;

					switch (args.length) {
						case 0:
							res = hook.fn.call(component);
							break;

						case 1:
							res = hook.fn.call(component, args[0]);
							break;

						default:
							res = hook.fn.apply(component, args);
					}

					if (hook.once) {
						toDelete ??= [];
						toDelete.push(i);
					}

					if (Object.isPromise(res)) {
						tasks ??= [];
						tasks.push(res);
					}
				});

				removeFromHooks(toDelete);

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (tasks != null) {
					return Promise.all(tasks).then(() => undefined);
				}
			}
		}
	}

	return SyncPromise.resolve();

	function removeFromHooks(toDelete: CanNull<number[]>) {
		if (toDelete != null) {
			toDelete.reverse().forEach((i) => {
				hooks.splice(i, 1);
			});
		}
	}
}
