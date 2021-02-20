/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { Options } from 'core/component/engines/zero/interface';

export const supports = {
	functional: false,
	composite: true
};

export const options: Options = {
	filters: {},
	directives: {}
};

export const
	minimalCtxCache = Object.createDict();
