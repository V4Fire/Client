/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { namespace } from 'core/kv-storage';

export const
	storage = namespace('session');

/**
 * Sets a new session
 *
 * @param [jwt]
 * @param [xsrf]
 */
export function setSession(jwt?: string | null, xsrf?: string | null): boolean {
	try {
		if (jwt) {
			storage.set('jwt', jwt);
		}

		if (xsrf) {
			storage.set('xsrf', xsrf);
		}

	} catch (_) {
		return false;
	}

	return true;
}

/**
 * Returns the current session object
 */
export function getSession(): {xsrf: string | null; jwt: string | null} {
	try {
		return {
			jwt: storage.get('jwt'),
			xsrf: storage.get('xsrf')
		};

	} catch (_) {
		return {jwt: null, xsrf: null};
	}
}

/**
 * Clears the current session
 */
export function clearSession(): boolean {
	try {
		storage.remove('jwt');
		storage.remove('xsrf');

	} catch (_) {
		return false;

	} finally {
		location.href = '/';
	}

	return true;
}

/**
 * Matches the specified session and the current
 *
 * @param [jwt]
 * @param [xsrf]
 */
export function matchSession(jwt?: string | null, xsrf?: string | null): boolean {
	try {
		return jwt === storage.get('jwt') && xsrf === storage.get('xsrf');

	} catch (_) {
		return false;
	}
}

/**
 * Returns true if the session object is exists
 */
export function isSessionExists(): boolean {
	try {
		return Boolean(storage.get('jwt') && storage.get('xsrf'));

	} catch (_) {
		return false;
	}
}
