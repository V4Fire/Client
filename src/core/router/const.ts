/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export const
	isExternal = /^(?:\w+:)?\/\/(?:[^\s]*)+$/,
	canParseStr = /^(?:true|false|null|undefined)$/m,
	qsClearFixRgxp = /[#?]\s*$/;

export const transitionOptions = [
	'meta',
	'params',
	'query'
];

export const routeNames = [
	'name',
	'page'
];

export const systemRouteParams = Object.createDict({
	url: true,
	...Object.fromArray(routeNames)
});

export const defaultRouteNames = Object.createDict({
	index: true,
	default: true
});
