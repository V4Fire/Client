/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * A link structure
 */
export interface SyncLink<T = unknown> {
	/**
	 * The link path
	 */
	path: string;

	/**
	 * Synchronizes the link's value with all tied objects
	 * @param [value] - a new value to set
	 */
	sync(value?: T): void;
}

/**
 * A map containing all registered links
 */
export type SyncLinkCache<T = unknown> = Map<
	string | object,
	Dictionary<SyncLink<T>>
>;
