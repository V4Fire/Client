'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Sets a new session
 *
 * @param [jwt]
 * @param [xsrf]
 */
export function setSession(jwt: ?string, xsrf: ?string) {
	try {
		if (jwt) {
			localStorage.setItem('jwt', jwt);
		}

		if (xsrf) {
			localStorage.setItem('xsrf', xsrf);
		}

	} catch (_) {}
}

/**
 * Returns the current session object
 */
export function getSession(): {xsrf: ?string, jwt: ?string} {
	try {
		return {
			jwt: localStorage.getItem('jwt'),
			xsrf: localStorage.getItem('xsrf')
		};

	} catch (_) {
		return {};
	}
}

/**
 * Clears the current session
 */
export function clearSession() {
	try {
		localStorage.removeItem('jwt');
		localStorage.removeItem('xsrf');

	} catch (_) {

	} finally {
		location.href = '/';
	}
}

/**
 * Matches the specified session and the current
 *
 * @param [jwt]
 * @param [xsrf]
 */
export function matchSession(jwt: ?string, xsrf: ?string): boolean {
	try {
		return jwt === localStorage.getItem('jwt') && xsrf === localStorage.getItem('xsrf');

	} catch (_) {
		return false;
	}
}

/**
 * Returns true if the session object is exists
 */
export function isSessionExists(): boolean {
	try {
		return Boolean(localStorage.getItem('jwt') && localStorage.getItem('xsrf'));

	} catch (_) {
		return false;
	}
}
