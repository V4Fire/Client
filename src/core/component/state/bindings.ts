/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { emitter as NetEmitter, NetStatus } from 'core/net';
import { emitter as SessionEmitter, Session } from 'core/session';
import { set } from 'core/component/state/const';

SessionEmitter.on('set', (e: Session) => {
	set('isAuth', Boolean(e.auth));
});

SessionEmitter.on('clear', () => {
	set('isAuth', false);
});

NetEmitter.on('status', (netStatus: NetStatus) => {
	set('isOnline', netStatus.status);
	set('lastOnlineDate', netStatus.lastOnline);
});
