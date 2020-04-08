/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Cache from 'super/i-block/modules/cache';
import { ModsNTable } from 'super/i-block/modules/mods';
import { ClassesCacheNms, ClassesCacheValue } from 'super/i-block/modules/provide/interface';

export const
	modsCache = Object.createDict<ModsNTable>();

export const classesCache = new Cache<ClassesCacheNms, ClassesCacheValue>([
	'base',
	'components',
	'els'
]);
