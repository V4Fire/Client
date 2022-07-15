/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ModsDict } from 'super/i-block/i-block';

export const
	modsCache = Object.createDict<ModsDict>(),
	baseClassesCache = Object.createDict<Dictionary<string>>(),
	componentClassesCache = Object.createDict<Dictionary<readonly string[]>>(),
	elementClassesCache = Object.createDict<Dictionary<readonly string[]>>();
