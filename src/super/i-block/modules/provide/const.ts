/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Cache from '@src/super/i-block/modules/cache';

import type { ModsNTable } from '@src/super/i-block/modules/mods';
import type { ClassesCacheNms, ClassesCacheValue } from '@src/super/i-block/modules/provide/interface';

export const
	modsCache = Object.createDict<ModsNTable>();

export const classesCache = new Cache<ClassesCacheNms, ClassesCacheValue>([
	'base',
	'components',
	'els'
]);
