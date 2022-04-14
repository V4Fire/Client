/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { PARENT } from 'core/component/const';

/**
 * Available "pure" types of a modifier value
 */
export type ModVal = string | boolean | number;

/**
 * Available types of a modifier value.
 * If a value wrapped with an array, it interprets as a value by default.
 */
export type ModDeclVal = CanArray<ModVal>;

/**
 * Expanded available types of a modifier value with support a feature of referring to a parent.
 * If a value wrapped with an array, it interprets as a value by default.
 */
export type ExpandedModDeclVal = ModDeclVal | typeof PARENT;

/**
 * Dictionary of registered modifiers and their possible values
 *
 * @example
 * ```typescript
 * const mods: ModsDecl = {
 *   focused: [
 *     true,
 *
 *     // The default value
 *     [false]
 *   ],
 *
 *   opened: [
 *     true,
 *     false
 *   ]
 * }
 * ```
 */
export interface ModsDecl {
	[name: string]: Nullable<ExpandedModDeclVal[]>;
}
