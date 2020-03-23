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

	const
		isDeep = opts?.deep;

	let
		needClone = false;

	if (Object.isArray(value)) {
		if (!isDeep) {
			return <any>value.slice();
		}

		needClone = true;
	}

	if (Object.isDictionary(value)) {
		if (!isDeep) {
			return {...value};
		}

		needClone = true;
	}

	if (Object.isMap(value)) {
		if (!isDeep) {
			return <any>new Map(value);
		}

		needClone = true;
	}

	if (Object.isSet(value)) {
		if (!isDeep) {
			return <any>new Set(value);
		}

		needClone = true;
	}

	if (needClone) {
		return Object.mixin(true, null, value);
	}

	return value;
}
