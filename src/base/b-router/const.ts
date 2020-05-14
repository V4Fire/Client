/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export const pageOptsKeys = [
	'meta',
	'params',
	'query'
];

export const defaultRoutes = Object.createDict({
	index: true,
	default: true
});

export const
	qsClearFixRgxp = /[#?]\s*$/,
	externalLinkRgxp = /^(?:\w+:)?\/\/(?:[^\s]*)+$/;
