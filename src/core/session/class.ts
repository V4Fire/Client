/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import type { SessionStore, SessionDescriptor, SessionKey, SessionParams } from 'core/session/interface';

export class Session {
	/**
	 * An event emitter to broadcast session events
	 */
	readonly emitter: EventEmitter = new EventEmitter({maxListeners: 100, newListener: false});

	/**
	 * A store of the original session
	 */
	readonly store: SessionStore;

	/**
	 * @param store - a store of the original session
	 */
	constructor(store: SessionStore) {
		this.store = store;
	}

	/**
	 * Returns true if the current session is already initialized
	 */
	async isExists(): Promise<boolean> {
		try {
			return Boolean((await this.get()).auth);

		} catch {
			return false;
		}
	}

	/**
	 * Returns information of the current session
	 */
	async get(): Promise<SessionDescriptor> {
		try {
			const
				s = await this.store;

			const [auth, params] = await Promise.all([
				s.get<SessionKey>('auth'),
				s.get<Dictionary>('params')
			]);

			return {
				auth,
				params
			};

		} catch {
			return {
				auth: undefined
			};
		}
	}

	/**
	 * Sets a new session with the specified parameters
	 *
	 * @param [auth]
	 * @param [params] - additional parameters
	 * @emits `set(session:` [[Session]] `)`
	 */
	async set(auth?: SessionKey, params?: SessionParams): Promise<boolean> {
		try {
			const
				s = await this.store;

			if (auth != null) {
				await s.set('auth', auth);
			}

			if (params != null) {
				await s.set('params', params);
			}

			this.emitter.emit('set', {auth, params});

		} catch {
			return false;
		}

		return true;
	}

	/**
	 * Clears the current session
	 * @emits `clear()`
	 */
	async clear(): Promise<boolean> {
		try {
			const s = await this.store;
			await Promise.all([s.remove('auth'), s.remove('params')]);
			this.emitter.emit('clear');

		} catch {
			return false;
		}

		return true;
	}

	/**
	 * Matches the passed session with the current one
	 *
	 * @param [auth]
	 * @param [params] - additional parameters
	 */
	async match(auth?: SessionKey, params?: Nullable<SessionParams>): Promise<boolean> {
		try {
			const s = await this.get();
			return auth === s.auth && (params === undefined || Object.fastCompare(params, s.params));

		} catch {
			return false;
		}
	}
}
