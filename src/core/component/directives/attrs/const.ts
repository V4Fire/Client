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

export const keyModifiers = Object.createDict({
	enter: true,
	tab: true,
	delete: true,
	esc: true,
	space: true,
	up: true,
	down: true,
	left: true,
	right: true
});

export const modifiers = Object.createDict({
	left: true,
	middle: true,
	right: true,
	ctrl: true,
	alt: true,
	shift: true,
	meta: true,
	exact: true,
	self: true,
	prevent: true,
	stop: true
});

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
