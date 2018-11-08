/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import log from 'core/log';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

const emitter = new EventEmitter({
	maxListeners: 1e3,
	wildcard: true
});

const
	emit = emitter.emit;

// tslint:disable-next-line:only-arrow-functions
emitter.emit = function (event: string, ...args: unknown[]): boolean {
	const res = emit.call(emitter, event, ...args);
	log(`global:event:${event.replace(/\./g, ':')}`, ...args);
	return res;
};

export default emitter;
