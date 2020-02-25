/*!
 * V4Fire Core
 * https://github.com/V4Fire/Core
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Core/blob/master/LICENSE
 */

import { structureWrappers } from 'core/object/watch/const';
import { WrapOptions, WatchHandler } from 'core/object/watch/interface';

/**
 * Wraps mutation methods of the specified object that they be able to emit events about mutations
 *
 * @param obj
 * @param opts - additional options
 * @param handlers - set of callbacks that are invoked on every mutation hooks
 *
 * @example
 * ```js
 * const arr = bindMutationHooks([], (value, oldValue, path) => {
 *   console.log(value, oldValue, path);
 * });
 *
 * arr.push(1);
 * arr.push(2);
 * arr.push(3);
 * ```
 */
export function bindMutationHooks<T extends object>(obj: T, opts: WrapOptions, handlers: Set<WatchHandler>): T;

/**
 * Wraps mutation methods of the specified object that they be able to emit events about mutations
 *
 * @param obj
 * @param handlers - set of callbacks that are invoked on every mutation hooks
 */
export function bindMutationHooks<T extends object>(obj: T, handlers: Set<WatchHandler>): T;
export function bindMutationHooks<T extends object>(
	obj: T,
	optsOrHandlers: Set<WatchHandler> | WrapOptions,
	handlersOrOpts?: WrapOptions | Set<WatchHandler>
): T {
	let
		handlers,
		opts;

	if (Object.isSet(handlersOrOpts)) {
		handlers = handlersOrOpts;
		opts = Object.isPlainObject(optsOrHandlers) ? optsOrHandlers : {};

	} else {
		handlers = optsOrHandlers;
		opts = {};
	}

	const wrappedCb = (args) => {
		if (!args) {
			return;
		}

		for (let i = 0; i < args.length; i++) {
			const
				a = args[i];

			console.log(handlers);

			for (let o = handlers, el = o.next(); !o.done; el = o.next()) {
				el.value(...a.slice(0, -1), {
					obj,
					isRoot: Boolean(opts.isRoot),
					path: a[a.length - 1]
				});
			}
		}
	};

	for (let i = 0, keys = Object.keys(structureWrappers); i < keys.length; i++) {
		const
			key = keys[i],
			el = structureWrappers[key];

		if (!el.is(obj)) {
			continue;
		}

		for (let keys = Object.keys(el.methods), i = 0; i < keys.length; i++) {
			const
				method = keys[i],
				getArgs = el.methods[method],
				original = obj[method];

			if (!getArgs) {
				continue;
			}

			obj[method] = function (...args: unknown[]): unknown {
				wrappedCb(getArgs(obj, opts.path, ...args));
				return original.apply(this, args);
			};
		}

		break;
	}

	return obj;
}
