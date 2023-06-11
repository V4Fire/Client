/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { componentItemType } from 'components/base/b-scrolly/const';
import type { MountedItem } from 'components/base/b-scrolly/interface';

/**
 * Возвращает `true` если переданное значение является типом `MountedItem`
 *
 * @param val
 */
export function isItem(val: any): val is MountedItem {
	return Object.isPlainObject(val) && val.type === componentItemType.item;
}
