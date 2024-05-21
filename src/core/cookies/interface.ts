/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface CookieStore {
	cookie: string;
}

export interface SetOptions {
	/**
	 * The path where the cookie is defined
	 * @default `'/'`
	 */
	path?: string;

	/**
	 * The domain in which the cookie file is defined.
	 * By default, cookies can only be used with the current domain.
	 * To allow the use of cookies for all subdomains, set this parameter to the value of the root domain.
	 */
	domain?: string;

	/**
	 * The date when the cookie file expires.
	 * Additionally, this option can be defined a string or number.
	 *
	 * @example
	 * ```js
	 * set('foo', 'bar', {expires: 'tomorrow'})
	 * ```
	 */
	expires?: Date | string | number;

	/**
	 * The maximum lifespan of the created cookie file in seconds.
	 * This option is an alternative to `expires`.
	 */
	maxAge?: number;

	/**
	 * If set to true, the cookie file can only be transmitted through a secure HTTPS connection.
	 * @default `false`
	 */
	secure?: boolean;

	/**
	 * This option specifies whether the cookie should be restricted to a first-party/same-site context.
	 * The option accepts three values:
	 *
	 * 1. `lax` - cookies are not sent on normal cross-site sub-requests
	 *    (for example, to load images or frames into a third party site), but are sent when a user is navigating to
	 *    the origin site (i.e., when following a link).
	 *
	 * 2. `strict` - cookies will only be sent in a first-party context and not be sent along with
	 *     requests initiated by third party websites.
	 *
	 * 3. `none` - cookies will be sent in all contexts, i.e., in responses to both first-party and cross-origin requests.
	 *     If this value is set, the cookie `secure` option must also be set (or the cookie will be blocked).
	 *
	 * @default '`lax`'
	 */
	samesite?: 'strict' | 'lax' | 'none';
}

export interface RemoveOptions {
	/**
	 * The path where the cookie is defined
	 * @default `'/'`
	 */
	path?: string;

	/**
	 * The domain in which the cookie file is defined
	 */
	domain?: string;
}
