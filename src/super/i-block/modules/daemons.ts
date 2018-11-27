/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { AsyncOpts } from 'core/async';
import { WatchOptions, Hooks } from 'core/component';
import { Statuses } from 'super/i-block/modules/interface';

export interface DaemonWatchObject extends WatchOptions {
	field: string;
}

export type DaemonWatcher = DaemonWatchObject | string;

export interface Daemon {
	hook?: Hooks[];
	watch?: DaemonWatcher[];
	wait?: Statuses;
	immediate?: boolean;
	asyncOptions?: AsyncOpts;
	fn: Function;
}

export type DaemonsDict = Dictionary<Daemon>;

/**
 * Inherit daemons
 *
 * @param daemons
 * @param parentDaemons
 */
export function inheritDaemons(daemons: DaemonsDict, parentDaemons: DaemonsDict): DaemonsDict {
	for (let keys = Object.keys(parentDaemons), i = 0; i < keys.length; i++) {
		const
			daemonName = keys[i],
			parentDaemon = parentDaemons[daemonName],
			daemon = daemons[daemonName];

		if (daemon && parentDaemon) {
			mergeDaemons(daemon, parentDaemon);
		}
	}

	return daemons;
}

/**
 * Merge two daemons
 *
 * @param a - target daemon
 * @param b - parent daemon
 */
export function mergeDaemons(a: Daemon, b: Daemon): Daemon {
	const
		hook = (a.hook || []).concat(b.hook || []),
		watch = (a.watch || []).concat(b.watch || []);

	return {
		...b,
		...a,
		hook,
		watch
	};
}
