/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ComponentInterface } from 'core/component/interface';

export const
	customWatcherRgxp = /^([!?]?)([^!?:]*):(.*)/,
	systemWatchers = new WeakMap<ComponentInterface, Dictionary<{cb: Set<Function>}>>();
