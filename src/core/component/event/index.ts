/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/event/README.md]]
 * @packageDocumentation
 */

import * as net from 'core/net';
import * as i18n from 'core/i18n';

//#if runtime has core/session
import * as session from 'core/session';
//#endif

import emitter from 'core/component/event/emitter';
import 'core/component/event/providers';

import type { ResetType } from 'core/component/event/interface';

export * from 'core/component/event/component-api';
export * from 'core/component/event/interface';

/**
 * Sends a message to reset all components of an application
 * @param [type] - reset type
 */
export function reset(type?: ResetType): void {
	emitter.emit(type != null ? `reset.${type}` : 'reset');
}

net.emitter.on('status', (...args) => {
	emitter.emit('net.status', ...args);
});

//#if runtime has core/session

session.emitter.on('set', (...args) => {
	emitter.emit('session.set', ...args);
});

session.emitter.on('clear', (...args) => {
	emitter.emit('session.clear', ...args);
});

//#endif

i18n.emitter.on('setLocale', (...args) => {
	emitter.emit('i18n.setLocale', ...args);
});

i18n.emitter.on('setRegion', (...args) => {
	emitter.emit('i18n.setRegion', ...args);
});

export default emitter;
