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

export const classAttrs = Object.createDict({
	class: 'class',
	'^class': 'class',
	'.className': '.className'
});

export const styleAttrs = Object.createDict({
	style: 'style',
	'^style': 'style',
	'.style': '.style'
});
