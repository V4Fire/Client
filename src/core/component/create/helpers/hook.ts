/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import log from 'core/log';
import SyncPromise from 'core/promise/sync';
import HookEmitter from 'core/component/create/helpers/event';
import { ComponentHook, ComponentInterface, ComponentMeta } from 'core/component/interface';

/**
 * Runs a hook from the specified meta object
 * (very critical for loading time)
 *
 * @param hook
 * @param meta
 * @param ctx - component context
 * @param args - event arguments
 */
export function runHook(
	hook: string,
	meta: ComponentMeta,
	ctx: ComponentInterface,
	...args: unknown[]
): Promise<void> {
	// @ts-ignore (access)
	// tslint:disable-next-line:no-string-literal
	ctx['hook'] = hook;

	// @ts-ignore (access)
	if (Object.isFunction(ctx.log)) {
		// @ts-ignore (access)
		ctx.log(`hook:${hook}`, ...args);

	} else {
		log(`component:hook:${meta.componentName}:${hook}`, ...args, ctx);
	}

	const
		hooks = meta.hooks[hook];

	if (!hooks.length) {
		return SyncPromise.resolve();
	}

	const
		event = new HookEmitter(),
		filteredHooks = <ComponentHook[]>[];

	for (let i = 0; i < hooks.length; i++) {
		const
			hook = hooks[i],
			nm = hook.name;

		if (!hook.once) {
			filteredHooks.push(hook);
		}

		event.on(hook.after, () => {
			const
				res = args.length ? hook.fn.apply(ctx, args) : hook.fn.call(ctx);

			if (res instanceof Promise) {
				return res.then(() => nm ? event.emit(nm) : undefined);
			}

			const
				tasks = nm ? event.emit(nm) : undefined;

			if (tasks !== undefined) {
				return tasks;
			}
		});
	}

	meta.hooks[hook] = filteredHooks;

	const
		tasks = event.drain();

	if (tasks instanceof Promise) {
		return tasks;
	}

	return SyncPromise.resolve();
}
