/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export const
	fakeCtx = typeof document !== 'undefined' ? document.createElement('div') : null,
	modRgxpCache = Object.createDict<RegExp>();

export const
	elementRxp = /_+/;
