/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import * as net from 'core/net';
import * as i18n from 'core/i18n';

//#if runtime has core/session
import * as session from 'core/session';
//#endif

import emitter from 'core/component/event/emitter';
import 'core/component/event/providers';

export type ResetType =
	'load' |
	'load.silence' |
	'router' |
	'router.silence' |
	'storage' |
	'storage.silence' |
	'silence';

/**
 * Sends a message for reset to all components
 * @param [type] - reset type
 */
export function reset(type?: ResetType): void {
	emitter.emit(type ? `reset.${type}` : 'reset');
}

net.event.on('status', (...args) => {
	emitter.emit('net.status', ...args);
});

//#if runtime has core/session

session.event.on('set', (...args) => {
	emitter.emit('session.set', ...args);
});

session.event.on('clear', (...args) => {
	emitter.emit('session.clear', ...args);
});

//#endif

i18n.event.on('setLocale', (...args) => {
	emitter.emit('i18n.setLocale', ...args);
});

export default emitter;
