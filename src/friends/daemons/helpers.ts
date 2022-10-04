/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Daemon, DaemonHook } from 'friends/daemons/interface';

/**
 * Merges two specified daemons into one new one and returns it
 *
 * @param daemon1
 * @param daemon2
 */
export function mergeDaemons(daemon1: Daemon, daemon2: Daemon): Daemon {
	const
		hook = mergeHooks(daemon1, daemon2),
		watch = (daemon2.watch ?? []).union(daemon1.watch ?? []);

	return {
		...daemon2,
		...daemon1,
		hook,
		watch
	};
}

/**
 * Merges hooks of the two specified daemons into one new one and returns it
 *
 * @param daemon1
 * @param daemon2
 */
export function mergeHooks(daemon1: Daemon, daemon2: Daemon): CanUndef<DaemonHook> {
	const
		{hook: hooks1} = daemon1,
		{hook: hooks2} = daemon2;

	if (hooks1 == null && hooks2 == null) {
		return;
	}

	const
		convertHooksToObject = (h) => Array.isArray(h) ? h.reduce((acc, a) => (acc[a] = undefined, acc), {}) : h;

	return {
		...convertHooksToObject(hooks2),
		...convertHooksToObject(hooks1)
	};
}
