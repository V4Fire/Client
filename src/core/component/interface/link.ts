/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Link structure
 */
export interface SyncLink<T = unknown> {
	/**
	 * Link path
	 */
	path: string;

	/**
	 * Synchronize the link value and with all tied objects
	 * @param [value] - new value to set
	 */
	sync(value?: T): void;
}

/**
 * Map of registered links
 */
export type SyncLinkCache<T = unknown> = Map<
	string | object,
	Dictionary<SyncLink<T>>
>;
