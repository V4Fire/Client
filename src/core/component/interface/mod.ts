/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { PARENT } from 'core/component/const';

/**
 * Modifier's value primitives
 */
export type ModVal = string | boolean | number;

/**
 * Modifier's value types.
 * If an array wraps a value, it interprets as the value by default.
 */
export type ModDeclVal = CanArray<ModVal>;

/**
 * Expanded modifier types with parent reference support.
 * If an array wraps a value, it interprets as the value by default.
 */
export type ExpandedModDeclVal = ModDeclVal | typeof PARENT;

/**
 * A dictionary that contains modifiers to pass to the component
 */
export type ModsProp = Dictionary<ModVal>;

/**
 * A dictionary that contains normalized modifiers
 */
export type ModsDict = Dictionary<CanUndef<string>>;

/**
 * A dictionary that contains predefined modifiers and their possible values
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
