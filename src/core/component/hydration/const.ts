/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export const
	styles = new Map<string, Promise<{default: string}>>();

/**
 * A key for empty data in the hydration storage
 */
export const emptyDataStoreKey = '[[EMPTY]]';
