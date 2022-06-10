/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Block from 'friends/block/class';

import { fakeCtx } from 'friends/block/const';
import { getFullElName } from 'friends/block/element';
import type { ModsTable } from 'super/i-block/modules/mods';

/**
 * Returns a CSS selector to the current component block
 *
 * @param [mods] - additional modifiers
 *
 * @example
 * ```js
 * // .b-foo
 * console.log(this.getBlockSelector());
 *
 * // .b-foo.b-foo_focused_true
 * console.log(this.getBlockSelector({focused: true}));
 * ```
 */
export function getBlockSelector(this: Block, mods?: ModsTable): string {
	let
		res = `.${this.getFullBlockName()}`;

	if (mods != null) {
		for (let keys = Object.keys(mods), i = 0; i < keys.length; i++) {
			const key = keys[i];
			res += `.${this.getFullBlockName(key, mods[key])}`;
		}
	}

	return res;
}

/**
 * Returns a CSS selector to the specified block element
 *
 * @param name - the element name
 * @param [mods] - additional modifiers
 *
 * @example
 * ```js
 * // .$componentId.b-foo__bla
 * console.log(this.getElSelector('bla'));
 *
 * // .$componentId.b-foo__bla.b-foo__bla_focused_true
 * console.log(this.getElSelector('bla', {focused: true}));
 * ```
 */
export function getElSelector(this: Block, name: string, mods?: ModsTable): string {
	let
		res = `.${this.componentId}.${getFullElName.call(this, name)}`;

	if (mods != null) {
		for (let keys = Object.keys(mods), i = 0; i < keys.length; i++) {
			const key = keys[i];
			res += `.${getFullElName.call(this, name, key, mods[key])}`;
		}
	}

	return res;
}

/**
 * Returns block child elements by the specified selector.
 * This overload is used to optimize DOM searching.
 *
 * @param ctx - a context node to search
 * @param name - the element name to search
 * @param [mods] - additional modifiers
 *
 * @example
 * ```js
 * console.log(this.elements(node, 'foo'));
 * console.log(this.elements(node, 'foo', {focused: true}));
 * ```
 */
export function elements<E extends Element = Element>(
	this: Block,
	ctx: Element,
	name: string,
	mods?: ModsTable
): NodeListOf<E>;

/**
 * Returns block child elements by the specified selector
 *
 * @param name - the element name to search
 * @param [mods] - additional modifiers
 *
 * @example
 * ```js
 * console.log(this.elements('foo'));
 * console.log(this.elements('foo', {focused: true}));
 * ```
 */
export function elements<E extends Element = Element>(
	this: Block,
	name: string,
	mods?: ModsTable
): NodeListOf<E>;

export function elements<E extends Element = Element>(
	this: Block,
	ctxOrName: Element | string,
	name?: string | ModsTable,
	mods?: ModsTable
): NodeListOf<E> {
	let
		ctx = this.node,
		elName;

		if (Object.isString(ctxOrName)) {
		elName = ctxOrName;

		if (Object.isPlainObject(name)) {
			mods = name;
		}

	} else {
		elName = name;
		ctx = ctxOrName;
	}

	ctx ??= this.node;

	if (ctx == null) {
		return fakeCtx.querySelectorAll('.loopback');
	}

	return ctx.querySelectorAll(getElSelector.call(this, elName, mods));
}

/**
 * Returns a block child element by the specified selector.
 * This overload is used to optimize DOM searching.
 *
 * @param ctx - a context node to search
 * @param name - the element name to search
 * @param [mods] - additional modifiers
 *
 * @example
 * ```js
 * console.log(this.element(node, 'foo'));
 * console.log(this.element(node, 'foo', {focused: true}));
 * ```
 */
export function element<E extends Element = Element>(
	this: Block,
	ctx: Element,
	name: string,
	mods?: ModsTable
): CanUndef<E>;

/**
 * Returns a block child element by the specified request
 *
 * @param name - the element name to search
 * @param [mods] - additional modifiers
 *
 * @example
 * ```js
 * console.log(this.element('foo'));
 * console.log(this.element('foo', {focused: true}));
 * ```
 */
export function element<E extends Element = Element>(
	this: Block,
	name: string,
	mods?: ModsTable
): CanUndef<E>;

export function element<E extends Element = Element>(
	this: Block,
	ctxOrName: Element | string,
	name?: string | ModsTable,
	mods?: ModsTable
): CanUndef<E> {
	let
		ctx = this.node,
		elName;

		if (Object.isString(ctxOrName)) {
		elName = ctxOrName;

		if (Object.isPlainObject(name)) {
			mods = name;
		}

	} else {
		elName = name;
		ctx = ctxOrName;
	}

	ctx ??= this.node;

	if (ctx == null) {
		return undefined;
	}

	return ctx.querySelector<E>(getElSelector.call(this, elName, mods)) ?? undefined;
}
