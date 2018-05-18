/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { isOnline } from 'core/net';
import { isExists } from 'core/session';

import state from 'core/component/state';
import semaphore from 'core/start/semaphore';

export default (async () => {
	const
		tasks = <Promise<any>[]>[];

	tasks.push(
		isOnline().then((v) => {
			state.isOnline = v.status;
			state.lastOnlineDate = v.lastOnline;
		}),

		isExists().then((v) => state.isAuth = v)
	);

	for (let i = 0; i < tasks.length; i++) {
		try {
			await tasks[i];
		} catch (_) {}
	}

	semaphore('stateReady');
})();
