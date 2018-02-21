/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/// <reference types="socket.io"/>
import URI = require('urijs');

export const PING = (5).seconds();
export type Socket = SocketIO.Client;

/**
 * Wrapper for sockets
 * @param [namespace] - connection namespace
 */
export default function socket(namespace: string = ''): SocketIO.Client {
	return require('socket.io-client').connect(new URI(API).path(namespace).toString(), {
		allowUpgrades: false,
		transports: ['websocket'],
		pingTimeout: PING,
		pingInterval: PING
	});
}
