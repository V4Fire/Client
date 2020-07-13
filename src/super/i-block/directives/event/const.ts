/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export const
	cache = new WeakMap(),
	commaRgxp = /\s*,\s*/g,
	keyValRgxp = /\.key\.([^.]*)/;
