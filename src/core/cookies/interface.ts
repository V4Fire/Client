/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface SetOptions {
	/**
	 * Path where the cookie is defined
	 * @default `'/'`
	 */
	path?: string;

	/**
	 * A domain where the cookie is defined.
	 * By default, the cookie can be used only with the current domain.
	 * To allow usage of the cookie for all subdomains, provide the root domain to this option.
	 */
	domain?: string;

	/**
	 * A date when the cookie is expired.
	 * The option can take string or number parameters to create a date.
	 *
	 * @example
	 * ```js
	 * set('foo', 'bar', {expires: 'tomorrow'})
	 * ```
	 */
	expires?: Date | string | number;

	/**
	 * The maximum seconds to live of the created cookie.
	 * This option is an alternative to `expires`.
	 */
	maxAge?: number;

	/**
	 * True if the cookie can be transferred only through secure HTTPS connections
	 * @default `false`
	 */
	secure?: boolean;

	/**
	 * This option declares if the cookie should be restricted to a first-party or same-site context.
	 * The option accepts three values:
	 *
	 * 1. `lax` - cookies are not sent on normal cross-site subrequests
	 *    (for example to load images or frames into a third party site), but are sent when a user is navigating to
	 *    the origin site (i.e. when following a link).
	 *
	 * 2. `strict` - cookies will only be sent in a first-party context and not be sent along with
	 *     requests initiated by third party websites.
	 *
	 * 3. `none` - cookies will be sent in all contexts, i.e. in responses to both first-party and cross-origin requests.
	 *     If this value is set, the cookie `secure` option must also be set (or the cookie will be blocked).
	 *
	 * @default '`lax`'
	 */
	samesite?: 'strict' | 'lax' | 'none';
}

export interface RemoveOptions {
	/**
	 * Path where the cookie is defined
	 * @default `'/'`
	 */
	path?: string;

	/**
	 * Domain where the cookie is defined
	 */
	domain?: string;
}
