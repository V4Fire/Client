/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Hook } from 'core/component';
import type { Daemon, DaemonWatcher } from 'components/friends/daemons/interface';

/**
 * Merges two specified daemons into one new one and returns it
 *
 * @param baseDaemon
 * @param parentDaemon
 */
export function mergeDaemons(baseDaemon: Daemon, parentDaemon: Daemon): Daemon {
	return {
		...parentDaemon,
		...baseDaemon,
		hook: mergeHooks(baseDaemon, parentDaemon),
		watch: mergeWatchers(baseDaemon, parentDaemon)
	};
}

/**
 * Merges hooks of the two specified daemons into one new one and returns it
 *
 * @param baseDaemon
 * @param parentDaemon
 */
export function mergeHooks(baseDaemon: Daemon, parentDaemon: Daemon): Hook[] {
	const
		{hook: baseHook} = baseDaemon,
		{hook: parentHook} = parentDaemon;

	if (baseHook == null && parentHook == null) {
		return [];
	}

	return Array.from(
		new Set(<Hook[]>Array.toArray(parentHook, baseHook))
	);
}

/**
 * Merges watchers of the two specified daemons into one new one and returns it
 *
 * @param baseDaemon
 * @param parentDaemon
 */
export function mergeWatchers(baseDaemon: Daemon, parentDaemon: Daemon): DaemonWatcher[] {
	const
		{watch: baseWatch} = baseDaemon,
		{watch: parentWatch} = parentDaemon;

	if (baseWatch == null && parentWatch == null) {
		return [];
	}

	return Array.from(
		new Set(<DaemonWatcher[]>Array.toArray(parentWatch, baseWatch))
	);
}
