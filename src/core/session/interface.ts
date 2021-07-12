/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Session identifier
 */
export type SessionKey = Nullable<
	string |
	boolean
>;

/**
 * Additional session parameters
 */
export interface SessionParams extends Dictionary {
	/**
	 * Value for a CSRF token
	 */
	csrf?: string;
}

/**
 * Object that contains session information
 */
export interface Session {
	/**
	 * Session key or a simple predicate (authorized/non-authorized)
	 */
	auth: SessionKey;

	/**
	 * Additional session parameters, like user non-secure info, etc.
	 */
	params?: Nullable<SessionParams>;
}
