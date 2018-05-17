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
	state.isAuth = await isExists();
	state.isOnline = await isOnline();
	semaphore('stateReady');
})();
