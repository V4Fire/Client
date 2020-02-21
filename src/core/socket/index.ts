/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/socket/README.md]]
 * @packageDocumentation
 */

import config from 'config';

import { PING } from 'core/socket/const';
import { Socket } from 'core/socket/interface';

export * from 'core/socket/const';
export * from 'core/socket/interface';

/**
 * Wrapper for a socket library
 * @param [namespace] - connection namespace
 */
export default function socket(namespace: string = ''): CanUndef<Socket> {
	//#if runtime has socket

	const
		socket = require('socket.io-client');

	if (config.api) {
		const url = new URL(config.api);
		return socket.connect((url.pathname = namespace).toString(), {
			allowUpgrades: false,
			transports: ['websocket'],
			pingTimeout: PING,
			pingInterval: PING
		});
	}

	//#endif
}
