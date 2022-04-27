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

const
	resolvedPromise = SyncPromise.resolve();

/**
 * Runs a component hook from the specified component instance
 *
 * @param hook - hook name
 * @param component - component instance
 * @param args - hook arguments
 */
export function runHook(hook: Hook, component: ComponentInterface, ...args: unknown[]): Promise<void> {
	const unsafe = Object.cast<Writable<ComponentInterface['unsafe']>>(
		component
	);

	unsafe.hook = hook;

	const
		m = component.unsafe.meta,
		hooks = m.hooks[hook];

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
			const
				emitter = new QueueEmitter(),
				filteredHooks: ComponentHook[] = [];

			for (let i = 0; i < hooks.length; i++) {
				const
					hook = hooks[i],
					nm = hook.name;

				if (!hook.once) {
					filteredHooks.push(hook);
				}

				emitter.on(hook.after, () => {
					const
						res = args.length > 0 ? hook.fn.apply(component, args) : hook.fn.call(component);

					if (Object.isPromise(res)) {
						return res.then(() => nm != null ? emitter.emit(nm) : undefined);
					}

					const
						tasks = nm != null ? emitter.emit(nm) : null;

					if (tasks != null) {
						return tasks;
					}
				});
			}

			m.hooks[hook] = filteredHooks;

			const
				tasks = emitter.drain();

			if (Object.isPromise(tasks)) {
				return tasks;
			}
		}
	}

	return resolvedPromise;
}
