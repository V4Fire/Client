/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import * as locale from 'core/i18n';
import * as net from 'core/net';

//#if runtime has core/session
import * as session from 'core/session';
//#endif

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

		//#if runtime has core/session
		session.isExists().then((v) => state.isAuth = v)
		//#endif
	);

	for (let i = 0; i < tasks.length; i++) {
		try {
			await tasks[i];
		} catch {}
	}

	semaphore('stateReady');
})();
