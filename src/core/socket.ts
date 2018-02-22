/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/// <reference types="node"/>
/// <reference types="socket.io-client"/>
import URI = require('urijs');

export const PING = (5).seconds();
export type Socket = SocketIOClient.Socket;

/**
 * Wrapper for sockets
 * @param [namespace] - connection namespace
 */
export default function socket(namespace: string = ''): Socket {
	return require('socket.io-client').connect(new URI(API).path(namespace).toString(), {
		allowUpgrades: false,
		transports: ['websocket'],
		pingTimeout: PING,
		pingInterval: PING
	});
}
