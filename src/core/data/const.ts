/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Provider from 'core/data/interface';

import { Socket } from 'core/socket';
import { RequestResponseObject } from 'core/request';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

export const
	providers = Object.createDict();

/**
 * Global event emitter for broadcasting provider events
 */
export const emitter = new EventEmitter({
	maxListeners: 1e3,
	newListener: false,
	wildcard: true
});

export const
	instanceCache: Dictionary<Provider> = Object.createDict(),
	requestCache: Dictionary<Dictionary<RequestResponseObject>> = Object.createDict(),
	connectCache: Dictionary<Promise<Socket>> = Object.createDict();
