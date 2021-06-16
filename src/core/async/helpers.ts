/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { unsuspendRgxp } from 'core/async/const';
import type { AsyncOptions } from 'core/async/interface';

/**
 * Takes an object with async options and returns a new one with a modified group to support task suspending
 *
 * @param opts
 * @param [groupMod] - additional group modifier
 *
 * @example
 * ```js
 * // {group: ':suspend', label: 'foo'}
 * console.log(addSuspendingGroup({label: 'foo'}));
 *
 * // {group: 'bar:suspend'}
 * console.log(addSuspendingGroup({group: 'bar'}));
 *
 * // {group: 'bar:baz:suspend'}
 * console.log(addSuspendingGroup({group: 'bar'}, 'baz'));
 *
 * // {group: 'bar:!suspend'}
 * console.log(addSuspendingGroup({group: 'bar:!suspend'}, 'baz'))
 * ```
 */
export function addSuspendingGroup<T extends AsyncOptions>(opts: T, groupMod?: string): T {
	let
		group = Object.isPlainObject(opts) ? opts.group : null;

	if (groupMod != null) {
		group = `${group ?? ''}:${groupMod}`;
	}

	if (group == null || RegExp.test(unsuspendRgxp, group)) {
		return opts;
	}

	return {...opts, group: `${group}:suspend`};
}
