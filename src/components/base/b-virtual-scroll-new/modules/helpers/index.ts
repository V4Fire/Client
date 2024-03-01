/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { componentItemType } from 'components/base/b-virtual-scroll-new/const';
import type { MountedItem } from 'components/base/b-virtual-scroll-new/interface';

/**
 * Returns `true` if the value is of type `MountedItem`, otherwise `false`
 * @param val - the value to check.
 */
export function isItem(val: any): val is MountedItem {
	return Object.isPlainObject(val) && val.type === componentItemType.item;
}

/**
 * Returns `true` if the specified value is an `async replace` error
 * @param val
 */
export function isAsyncReplaceError(val: unknown): boolean {
	return Object.isPlainObject(val) && val.join === 'replace';
}
