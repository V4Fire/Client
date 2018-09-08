/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/// <reference types="node"/>
/// <reference types="socket.io-client"/>

import config from 'config';
export const PING = (5).seconds();
export type Socket = SocketIOClient.Socket;

/**
 * Wrapper for sockets
 * @param [namespace] - connection namespace
 */
export default function socket(namespace: string = ''): Socket | undefined {
	let socket;

	try {
		socket = require('socket.io-client');

	} catch (_) {}

	if (socket && config.api) {
		const url = new URL(config.api);
		return socket.connect((url.pathname = namespace).toString(), {
			allowUpgrades: false,
			transports: ['websocket'],
			pingTimeout: PING,
			pingInterval: PING
		});
	}
}
