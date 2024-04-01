/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export const
	styles = new Map<string, Promise<{default: string}>>(),

	/**
	 * Key of empty data in hydration storage
	 */
	emptyDataStoreKey = '[[EMPTY]]';
