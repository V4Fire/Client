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

export interface Daemon<T = unknown> {
	hook?: Hooks[];
	watch?: DaemonWatcher[];
	wait?: Statuses;
	immediate?: boolean;
	asyncOptions?: AsyncOpts;
	fn(this: T): unknown;
}

export type DaemonsDict<T = unknown> = Dictionary<Daemon<T>>;

/**
 * Inherit daemons from parent and returns new daemons dict
 *
 * @param base
 * @param parent
 */
export function createDaemons(base: DaemonsDict, parent: DaemonsDict): DaemonsDict {
	const
		mixedDaemons: DaemonsDict = {};

	for (let keys = Object.keys(parent), i = 0; i < keys.length; i++) {
		const
			daemonName = keys[i],
			parentDaemon = parent[daemonName],
			daemon = base[daemonName];

		if (daemon && parentDaemon) {
			mixedDaemons[daemonName] = mergeDaemons(daemon, parentDaemon);
		}
	}

	return mixedDaemons;
}

/**
 * Merge two daemons
 *
 * @param a - base daemon
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
