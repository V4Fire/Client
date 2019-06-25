/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import * as locale from 'core/i18n';
import * as net from 'core/net';
import * as session from 'core/session';

import state from 'core/component/state';
import semaphore from 'core/init/semaphore';

export default (async () => {
	const
		tasks = <Promise<unknown>[]>[];

	tasks.push(
		locale.isInitialized,

		net.isOnline().then((v) => {
			state.isOnline = v.status;
			state.lastOnlineDate = v.lastOnline;
		}),

		session.isExists().then((v) => state.isAuth = v)
	);

	for (let i = 0; i < tasks.length; i++) {
		try {
			await tasks[i];
		} catch {}
	}

	semaphore('stateReady');
})();
