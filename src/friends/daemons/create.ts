/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iBlock from 'super/i-block/i-block';
import { wait } from 'super/i-block/decorators';

import type Daemons from 'friends/daemons/class';
import { mergeDaemons } from 'friends/daemons/helpers';

import type { Daemon, WrappedDaemon, DaemonsDict } from 'friends/daemons/interface';

/**
 * Creates a new daemon dictionary with inheriting from the specified parent and returns it
 *
 * @param daemons
 * @param [parentDaemons]
 */
export function createDaemons<CTX extends iBlock = iBlock>(
	daemons: DaemonsDict,
	parentDaemons?: DaemonsDict
): DaemonsDict<CTX['unsafe']> {
	const
		mixedDaemons = {...parentDaemons, ...daemons};

	if (parentDaemons != null) {
		Object.entries(parentDaemons).forEach(([daemonName, parentDaemon]) => {
			const
				daemon = daemons[daemonName];

			if (daemon != null && parentDaemon != null) {
				mixedDaemons[daemonName] = mergeDaemons(daemon, parentDaemon);
			}
		});
	}

	return mixedDaemons;
}

/**
 * Registers a new daemon by the specified name
 *
 * @param name
 * @param daemon
 */
export function register(this: Daemons, name: string, daemon: WrappedDaemon): void {
	this.daemons[name] = daemon;
}

/**
 * Creates a wrapped function for the specified daemon
 * @param daemon
 */
export function createDaemonWrappedFn(daemon: Daemon): WrappedDaemon {
	(<WrappedDaemon>daemon).wrappedFn = daemon.wait != null ? wait(daemon.wait, daemon.fn) : daemon.fn;
	return Object.cast(daemon);
}
