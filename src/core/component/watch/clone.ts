/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { WatchOptions } from 'core/object/watch';

/**
 * Clones the specified watcher value
 *
 * @param value
 * @param [opts]
 */
export function cloneWatchValue<T>(value: T, opts?: WatchOptions): T {
	if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
		return value;
	}

	if (Object.isArray(value)) {
		if (opts?.deep) {
			return Object.mixin(true, [], value);
		}

		return <any>value.slice();
	}

	if (Object.isSimpleObject(value)) {
		if (opts?.deep) {
			return Object.mixin(true, {}, value);
		}

		return {...value};
	}

	return value;
}
