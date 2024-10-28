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

import { globalEmitter } from 'core/component/event/emitter';

if (!SSR) {
	i18nEmitter.on('setLocale', (...args) => {
		globalEmitter.emit('i18n.setLocale', ...args);
	});

	i18nEmitter.on('setRegion', (...args) => {
		globalEmitter.emit('i18n.setRegion', ...args);
	});

	netEmitter.on('status', (...args) => {
		globalEmitter.emit('net.status', ...args);
	});

	sessionEmitter.on('set', (...args) => {
		globalEmitter.emit('session.set', ...args);
	});

	sessionEmitter.on('clear', (...args) => {
		globalEmitter.emit('session.clear', ...args);
	});
}
