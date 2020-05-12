/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ModVal, ModsDecl } from 'core/component';

/**
 * Raw modifiers
 */
export type ModsTable = Dictionary<ModVal>;

/**
 * Normalized modifiers
 */
export type ModsNTable = Dictionary<CanUndef<string>>;

export { ModVal, ModsDecl };
