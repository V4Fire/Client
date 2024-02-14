/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { initGlobalEnv } from 'core/env';

import * as net from 'core/net';
import * as session from 'core/session';

import type { InitAppOptions } from 'core/init/interface';

/**
 * Initializes the global state of the application (user session initialization, online status loading, etc.)
 * @param params - additional initialization parameters
 */
export default async function initState(params: InitAppOptions): Promise<void> {
	initGlobalEnv(params);
	params.isOnline = true;

	if (!SSR) {
		net.isOnline()
			.then((v) => {
				params.isOnline = v.status;
				params.lastOnlineDate = v.lastOnline;
			})

			.catch(stderr);

		try {
			await session.isExists().then((status: boolean) => params.isAuth = status);

		} catch (err) {
			stderr(err);
		}
	}

	void params.ready('stateReady');
}
