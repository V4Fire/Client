/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { locale } from 'core/i18n';

import * as net from 'core/net';
import * as session from 'core/session';

import state from 'core/component/state';
import semaphore from 'core/init/semaphore';

export default (async () => {
	state.isOnline = true;

	net.isOnline()
		.then((v) => {
			state.isOnline = v.status;
			state.lastOnlineDate = v.lastOnline;
		})

		.catch(stderr);

	try {
		await Promise.allSettled([
			locale.isInitialized,
			session.isExists().then((v) => state.isAuth = v)
		]);

	} catch (err) {
		stderr(err);
	}

	void semaphore('stateReady');
})();
