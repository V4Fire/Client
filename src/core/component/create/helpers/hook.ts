/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import log from 'core/log';
import HookEmitter, { createSyncPromise } from 'core/component/create/helpers/event';
import { ComponentInterface, ComponentMeta } from 'core/component/interface';

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
	// @ts-ignore
	ctx.hook = hook;

	// @ts-ignore
	if (Object.isFunction(ctx.log)) {
		// @ts-ignore
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
			hook = hooks[i],
			nm = hook.name;

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

	const
		tasks = event.drain();

	if (tasks instanceof Promise) {
		return tasks;
	}

	return createSyncPromise();
}
