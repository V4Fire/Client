/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { emitter as i18nEmitter } from 'core/i18n';
import { emitter as netEmitter } from 'core/net';
import { emitter as sessionEmitter } from 'core/session';

import emitter from 'core/component/event/emitter';

i18nEmitter.on('setLocale', (...args) => {
	emitter.emit('i18n.setLocale', ...args);
});

netEmitter.on('status', (...args) => {
	emitter.emit('net.status', ...args);
});

sessionEmitter.on('set', (...args) => {
	emitter.emit('session.set', ...args);
});

sessionEmitter.on('clear', (...args) => {
	emitter.emit('session.clear', ...args);
});
