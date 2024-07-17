/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/session/README.md]]
 * @packageDocumentation
 */

import session from 'core/session/engines';

import { Session } from 'core/session/class';
import type { SessionStore } from 'core/session/interface';

export * from 'core/session/class';
export * from 'core/session/interface';

export const globalSession = new Session(session);

/**
 * Returns an API for managing the session of the specified store
 * @param from
 */
export const from = (from: SessionStore): Session => new Session(from);

export const {emitter} = globalSession;

export const
	isExists = globalSession.isExists.bind(globalSession),
	get = globalSession.get.bind(globalSession),
	set = globalSession.set.bind(globalSession),
	clear = globalSession.clear.bind(globalSession),
	match = globalSession.match.bind(globalSession);
