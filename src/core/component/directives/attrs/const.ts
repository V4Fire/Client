/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export const
	modRgxp = /\S\./,
	directiveRgxp = /v-(.*?)(?::(.*?))?(\..*)?$/;

export const
	handlers = new WeakMap<object, Map<unknown, Function>>();
