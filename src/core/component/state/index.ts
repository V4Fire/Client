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

import watch from 'core/object/watch';

import { emitter as NetEmitter, NetStatus } from 'core/net';
import { emitter as SessionEmitter, Session } from 'core/session';

import type { State } from 'core/component/state/interface';

export * from 'core/component/state/interface';

const state = watch<State>({
	isAuth: undefined,
	isOnline: undefined,
	lastOnlineDate: undefined,
	experiments: undefined
}).proxy;

SessionEmitter.on('set', (e: Session) => {
	state.isAuth = Boolean(e.auth);
});

SessionEmitter.on('clear', () => {
	state.isAuth = false;
});

NetEmitter.on('status', (netStatus: NetStatus) => {
	state.isOnline = netStatus.status;
	state.lastOnlineDate = netStatus.lastOnline;
});

export default state;
