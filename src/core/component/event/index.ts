/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import * as net from 'core/net';
import * as session from 'core/session';
import * as i18n from 'core/i18n';

import emitter from 'core/component/event/emitter';
import 'core/component/event/providers';

export type ResetType =
	'load' |
	'router' |
	'storage';

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

session.event.on('set', (...args) => {
	emitter.emit('session.set', ...args);
});

session.event.on('clear', (...args) => {
	emitter.emit('session.clear', ...args);
});

i18n.event.on('setLang', (...args) => {
	emitter.emit('i18n.setLang', ...args);
});

export default emitter;
