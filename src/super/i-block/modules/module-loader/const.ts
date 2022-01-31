/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Module } from '/super/i-block/modules/module-loader/interface';

export const
	cache = new Map<unknown, Module>(),
	cachedModules = <Module[]>[];
