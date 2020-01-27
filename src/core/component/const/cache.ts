/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ComponentOptions, ComponentDriver } from 'core/component/engines';
import { ComponentMeta, ComponentParams } from 'core/component/interface';

export const
	componentParams = new Map<Function | string, ComponentParams>(),
	rootComponents = Object.createDict<Promise<ComponentOptions<ComponentDriver>>>(),
	components = new Map<Function | string, ComponentMeta>();

export const
	regCache = Object.createDict<Function[]>(),
	minimalCtxCache = Object.createDict(),
	tplCache = Object.createDict();

export const
	metaPointers = Object.createDict<Dictionary<boolean>>();
