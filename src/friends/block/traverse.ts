/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Friend from 'friends/friend';
import type { ModsDict } from 'super/i-block/i-block';

import { fakeCtx } from 'friends/block/const';
import { getFullBlockName } from 'friends/block/block';

/**
 * Returns a CSS selector to the current component block
 *
 * @param [mods] - additional modifiers
 * @example
 * ```js
 * // .b-foo
 * console.log(this.block.getBlockSelector());
 *
 * // .b-foo.b-foo_focused_true
 * console.log(this.block.getBlockSelector({focused: true}));
 * ```
 */
export function getBlockSelector(this: Friend, mods?: ModsDict): string {
	let
		res = `.${(<Function>getFullBlockName).call(this)}`;

	if (mods != null) {
		for (let keys = Object.keys(mods), i = 0; i < keys.length; i++) {
			const key = keys[i];
			res += `.${getFullBlockName.call(this, key, mods[key])}`;
		}
	}

	return res;
}

/**
 * Returns the fully qualified name of the specified block element
 *
 * @param name - the element name
 * @example
 * ```js
 * // b-foo__bla
 * console.log(this.block.getFullElName('bla'));
 * ```
 */
export function getFullElName(this: Friend, name: string): string;

/**
 * Returns the fully qualified name of the specified block element, given the passed modifier
 *
 * @param name - the element name
 * @param modName - the modifier name
 * @param modValue - the modifier value
 *
 * @example
 * ```js
 * // b-foo__bla_focused_true
 * console.log(this.block.getBlockSelector('bla', 'focused', true));
 * ```
 */
export function getFullElName(this: Friend, name: string, modName: string, modValue: unknown): string;
export function getFullElName(this: Friend, name: string, modName?: string, modValue?: unknown): string {
	const modStr = modName != null ? `_${modName.dasherize()}_${String(modValue).dasherize()}` : '';
	return `${this.componentName}__${name.dasherize()}${modStr}`;
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
 * console.log(this.block.getElSelector('bla'));
 *
 * // .$componentId.b-foo__bla.b-foo__bla_focused_true
 * console.log(this.block.getElSelector('bla', {focused: true}));
 * ```
 */
export function getElSelector(this: Friend, name: string, mods?: ModsDict): string {
	let
		res = `.${(<Function>getFullElName).call(this, name)}`;

	if (!this.ctx.isFunctional) {
		res += `.${this.componentId}`;
	}

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
 * console.log(this.block.elements(node, 'foo'));
 * console.log(this.block.elements(node, 'foo', {focused: true}));
 * ```
 */
export function elements<E extends Element = Element>(
	this: Friend,
	ctx: Element,
	name: string,
	mods?: ModsDict
): ArrayLike<E>;

/**
 * Returns block child elements by the specified selector
 *
 * @param name - the element name to search
 * @param [mods] - additional modifiers
 *
 * @example
 * ```js
 * console.log(this.block.elements('foo'));
 * console.log(this.block.elements('foo', {focused: true}));
 * ```
 */
export function elements<E extends Element = Element>(
	this: Friend,
	name: string,
	mods?: ModsDict
): ArrayLike<E>;

export function elements<E extends Element = Element>(
	this: Friend,
	ctxOrName: Element | string,
	name?: string | ModsDict,
	mods?: ModsDict
): ArrayLike<E> {
	const
		$el = this.node;

	let
		ctxToSearch = $el,
		elName;

		if (Object.isString(ctxOrName)) {
		elName = ctxOrName;

		if (Object.isPlainObject(name)) {
			mods = name;
		}

	} else {
		elName = name;
		ctxToSearch = ctxOrName;
	}

	ctxToSearch ??= $el;

	if (ctxToSearch == null || $el == null) {
		return fakeCtx.querySelectorAll('.loopback');
	}

	const
		selector = getElSelector.call(this, elName, mods),
		elements = ctxToSearch.querySelectorAll<E>(selector);

	if (this.ctx.isFunctional) {
		$el.classList.remove('i-block-helper');

		const
			redundantElements = ctxToSearch.querySelectorAll(`.i-block-helper${getBlockSelector.call(this)} ${selector}`);

		$el.classList.add('i-block-helper');

		if (redundantElements.length > 0) {
			const
				filteredElements = new Set(Object.cast(elements));

			for (let i = 0; i < redundantElements.length; i++) {
				filteredElements.delete(redundantElements[i]);
			}

			return Object.cast(Array.from(filteredElements));
		}
	}

	return elements;
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
 * console.log(this.block.element(node, 'foo'));
 * console.log(this.block.element(node, 'foo', {focused: true}));
 * ```
 */
export function element<E extends Element = Element>(
	this: Friend,
	ctx: Element,
	name: string,
	mods?: ModsDict
): CanUndef<E>;

/**
 * Returns a block child element by the specified selector
 *
 * @param name - the element name to search
 * @param [mods] - additional modifiers
 *
 * @example
 * ```js
 * console.log(this.block.element('foo'));
 * console.log(this.block.element('foo', {focused: true}));
 * ```
 */
export function element<E extends Element = Element>(
	this: Friend,
	name: string,
	mods?: ModsDict
): CanUndef<E>;

export function element<E extends Element = Element>(
	this: Friend,
	ctxOrName: Element | string,
	name?: string | ModsDict,
	mods?: ModsDict
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

	if (this.ctx.isFunctional) {
		return Object.cast(elements.call(this, elName, mods)[0]);
	}

	return ctx.querySelector<E>(getElSelector.call(this, elName, mods)) ?? undefined;
}
