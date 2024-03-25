/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { State } from 'core/component';
import type { NetStatus } from 'core/net';

/**
 * Checks the online status for the application
 * @param state - the global application state
 */
export function checkOnline(state: State): Promise<void> {
	state.net.isOnline().then(setState).catch(stderr);
	state.async.on(state.net.emitter, 'status', setState);

	return Promise.resolve();

	function setState({status, lastOnline}: NetStatus) {
		state.isOnline = status;
		state.lastOnlineDate = lastOnline;
	}
}
