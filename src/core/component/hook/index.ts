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
	const {unsafe, unsafe: {meta}} = component;
	unsafe.hook = hook;

	let
		hooks = meta.hooks[hook];

	if (component.isFlyweight && hooks.length > 0) {
		if (hooks.length === 1 && hooks[0].functional === false) {
			return resolvedPromise;
		}

		const
			functionalHooks = <ComponentHook[]>[];

		for (let i = 0; i < hooks.length; i++) {
			const
				el = hooks[i];

			if (el.functional !== false) {
				functionalHooks.push(el);
			}
		}

		if (functionalHooks.length !== hooks.length) {
			hooks = functionalHooks;
		}
	}

	switch (hooks.length) {
		case 0:
			break;

		case 1: {
			const
				hook = hooks[0],
				res = args.length > 0 ? hook.fn.apply(component, args) : hook.fn.call(component);

			if (hook.once) {
				hooks.splice(0, 1);
			}

			if (Object.isPromise(res)) {
				return <any>res;
			}

			break;
		}

		default: {
			const
				emitter = new QueueEmitter(),
				filteredHooks = <ComponentHook[]>[];

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

			meta.hooks[hook] = filteredHooks;

			const
				tasks = emitter.drain();

			if (Object.isPromise(tasks)) {
				return tasks;
			}
		}
	}

	return resolvedPromise;
}
