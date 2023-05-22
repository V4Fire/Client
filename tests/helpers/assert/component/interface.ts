/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ModVal } from 'core/component';

export { ModVal };

export type ComponentItemId = string | number;

export type ComponentItemIds = ComponentItemId[];

export type AssertComponentItemsHaveMod = (value: ModVal, itemIds: ComponentItemIds | ComponentItemId) => Promise<void>;

export type AssertItems = (itemIds: ComponentItemIds | ComponentItemId) => Promise<void>;
