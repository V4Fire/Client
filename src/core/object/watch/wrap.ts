/*!
 * V4Fire Core
 * https://github.com/V4Fire/Core
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Core/blob/master/LICENSE
 */

import { structureWrappers } from 'core/object/watch/const';
import { WatchOptions, WatchHandler } from 'core/object/watch/interface';

/**
 * Wraps the specified object with mutation hooks
 *
 * @param obj
 * @param cb - callback that is invoked on every mutation hook
 * @param [opts]
 */
export function bindMutationHooks<T extends object>(
	obj: T,
	cb: WatchHandler,
	opts: WatchOptions = {}
): T {
	const wrappedCb = (args) => {
		if (!args) {
			return;
		}

		for (let i = 0; i < args.length; i++) {
			cb(...args[i]);
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
