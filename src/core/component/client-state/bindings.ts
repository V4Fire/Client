/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { emitter as netEmitter, NetStatus } from 'core/net';
import { emitter as sessionEmitter, SessionDescriptor } from 'core/session';
import { set } from 'core/component/client-state/const';

if (!SSR) {
	sessionEmitter.on('set', (e: SessionDescriptor) => {
		set('isAuth', Boolean(e.auth));
	});

	sessionEmitter.on('clear', () => {
		set('isAuth', false);
	});

	netEmitter.on('status', (netStatus: NetStatus) => {
		set('isOnline', netStatus.status);
		set('lastOnlineDate', netStatus.lastOnline);
	});
}
