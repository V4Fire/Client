/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { unsuspendRgxp } from '@src/core/async/const';
import type { AsyncOptions } from '@src/core/async/interface';

/**
 * Takes an object with async options and returns a new one with a modified group to support task suspending.
 * To prevent suspending provide a group with the  `:!suspend` modifier.
 *
 * @param opts
 * @param [groupMod] - additional group modifier
 *
 * @example
 * ```js
 * // {label: 'foo'}
 * console.log(wrapWithSuspending({label: 'foo'}));
 *
 * // {group: ':baz:suspend', label: 'foo'}
 * console.log(wrapWithSuspending({label: 'foo'}), 'baz');
 *
 * // {group: 'bar:suspend'}
 * console.log(wrapWithSuspending({group: 'bar'}));
 *
 * // {group: 'bar:baz:suspend'}
 * console.log(wrapWithSuspending({group: 'bar'}, 'baz'));
 *
 * // {group: 'bar:!suspend'}
 * console.log(wrapWithSuspending({group: 'bar:!suspend'}, 'baz'))
 * ```
 */
export function wrapWithSuspending<T extends AsyncOptions>(opts: T, groupMod?: string): T {
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
