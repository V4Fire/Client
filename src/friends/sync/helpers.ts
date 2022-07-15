/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Friend from 'friends/friend';
import type { AsyncWatchOptions } from 'friends/sync/interface';

/**
 * Compares the new and old value of a watchable property
 *
 * @param value
 * @param oldValue
 * @param destPath - a path to the property
 * @param opts - watch options
 */
export function compareNewAndOldValue(
	this: Friend,
	value: unknown,
	oldValue: unknown,
	destPath: string,
	opts: AsyncWatchOptions
): boolean {
	if (opts.collapse === false) {
		return value === oldValue;
	}

	return !opts.withProto && (
		Object.fastCompare(value, oldValue) &&
		Object.fastCompare(value, this.field.get(destPath))
	);
}
