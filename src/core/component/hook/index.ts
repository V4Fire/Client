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

import log from 'core/log';
import SyncPromise from 'core/promise/sync';
import QueueEmitter from 'core/component/queue-emitter';
import { ComponentHook, ComponentInterface } from 'core/component/interface';

/**
 * Runs a component hook from the specified component instance
 *
 * @param hook - hook name
 * @param component - component instance
 * @param args - hook arguments
 */
export function runHook(hook: string, component: ComponentInterface, ...args: unknown[]): Promise<void> {
	const {unsafe, unsafe: {meta}} = component;
	Object.set(unsafe, 'hook', hook);

	// eslint-disable-next-line @typescript-eslint/unbound-method
	if (Object.isFunction(component.log)) {
		component.log(`hook:${hook}`, ...args);

	} else {
		log(`component:hook:${meta.componentName}:${hook}`, ...args, component);
	}

	const
		hooks = meta.hooks[hook];

	if (hooks.length === 0) {
		return SyncPromise.resolve();
	}

	const
		emitter = new QueueEmitter(),
		filteredHooks = <ComponentHook[]>[];

	for (let i = 0; i < hooks.length; i++) {
		const
			hook = <ComponentHook>hooks[i],
			nm = hook.name;

		if (!hook.once) {
			filteredHooks.push(hook);
		}

		emitter.on(hook.after, () => {
			const
				res = args.length > 0 ? hook.fn.apply(component, args) : hook.fn.call(component);

			if (res instanceof Promise) {
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

	if (tasks instanceof Promise) {
		return tasks;
	}

	return SyncPromise.resolve();
}
