'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	URI = require('urijs');

export default class IO {
	/**
	 * @param namespace - connection namespace
	 */
	constructor(namespace?: string = ''): Socket {
		return require('socket.io-client').connect(new URI(API).path(namespace).toString(), {
			allowUpgrades: false,
			transports: ['websocket'],
			pingTimeout: (5).seconds(),
			pingInterval: (5).seconds()
		});
	}
}
