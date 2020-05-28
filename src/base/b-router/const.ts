/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export const transitionOptions = [
	'meta',
	'params',
	'query'
];

export const systemRouteParams = Object.createDict({
	url: true,
	name: true,
	page: true
});

export const defaultRoutes = Object.createDict({
	index: true,
	default: true
});

export const
	qsClearFixRgxp = /[#?]\s*$/,
	isExternal = /^(?:\w+:)?\/\/(?:[^\s]*)+$/;
