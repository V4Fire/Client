/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';
import { AsyncOpts } from 'core/async';
import { WatchOptions, Hooks, ComponentInterface } from 'core/component';
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
	suspended?: boolean;
	fn: Function;
}

export interface DaemonSpawnStatus {
	spawned: boolean;
	killed: boolean;
}

export interface DaemonSpawnedObj {
	fn: Function;
	wait?: Statuses;
	immediate?: boolean;
	asyncOptions?: AsyncOpts;
}

export type SpawnedDaemon = DaemonSpawnedObj | Function;

export type DaemonsDict = Dictionary<Daemon>;

/**
 * Calls daemon function
 *
 * @param name - daemon name
 * @param fn - daemon function
 * @param args - arguments passed to daemon function
 * @param immediate
 * @param asyncParams
 */
export function callDaemon(
	ctx: ComponentInterface,
	name: string,
	fn: Function,
	args: unknown[],
	immediate: boolean = true,
	asyncParams: AsyncOpts = {}
): void {
	const
		// @ts-ignore
		{$async: $a} = ctx,
		daemons = (<typeof iBlock>ctx.instance.constructor).daemons;

	if (!daemons) {
		return;
	}

	const
		daemon = daemons[name];

	if (!daemon || daemon.suspended) {
		return;
	}

	if (immediate) {
		Object.assign(asyncParams, {
			group: `daemons-${ctx.componentName}`,
			label: `daemons-${name}`
		});

		$a.setImmediate(() => fn.apply(ctx, args), asyncParams);

	} else {
		fn.call(ctx);
	}
}

/**
 * Inherits base daemons from parent and returns a new object
 *
 * @param base
 * @param parent
 */
export function createDaemons(base: DaemonsDict, parent: DaemonsDict): DaemonsDict {
	const
		mixedDaemons = {...parent, ...base};

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
		hook = [...new Set((a.hook || []).concat(b.hook || []))],
		watch = (b.watch || []).concat(a.watch || []);

	return {
		...b,
		...a,
		hook,
		watch
	};
}
