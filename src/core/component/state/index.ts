/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/state/README.md]]
 * @packageDocumentation
 */

import watchObj from 'core/object/watch';

import { emitter as NetEmitter, NetStatus } from 'core/net';
import { emitter as SessionEmitter, Session } from 'core/session';

import type { State } from 'core/component/state/interface';

export * from 'core/component/state/interface';

const watcher = watchObj<State>({
	isAuth: undefined,
	isOnline: undefined,
	lastOnlineDate: undefined,
	experiments: undefined
});

export default watcher.proxy;

export const
	watch = watchObj.bind(null, watcher.proxy),
	set = watcher.set.bind(watcher),
	unset = watcher.delete.bind(watcher);

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
