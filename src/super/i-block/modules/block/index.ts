/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-block/modules/block/README.md]]
 * @packageDocumentation
 */

import Friend from 'super/i-block/modules/friend';

import { ModsTable, ModsNTable } from 'super/i-block/modules/mods';
import { fakeCtx, modRgxpCache, elRxp } from 'super/i-block/modules/block/const';

import {

	ModEvent,
	ModEventReason,
	SetModEvent,

	ElementModEvent,
	SetElementModEvent

} from 'super/i-block/modules/block/interface';

export * from 'super/i-block/modules/block/interface';

/**
 * Class implements BEM-like API
 */
export default class Block extends Friend {
	/**
	 * Map of applied modifiers
	 */
	protected readonly mods?: Dictionary<CanUndef<string>>;

	/** @override */
	constructor(component: any) {
		super(component);
		this.mods = Object.createDict();

		for (let m = component.mods, keys = Object.keys(m), i = 0; i < keys.length; i++) {
			const name = keys[i];
			this.setMod(name, m[name], 'initSetMod');
		}
	}

	/**
	 * Returns the full name of the current block
	 *
	 * @param [modName]
	 * @param [modValue]
	 *
	 * @example
	 * ```js
	 * // b-foo
	 * this.getFullBlockName();
	 *
	 * // b-foo_focused_true
	 * this.getFullBlockName('focused', true);
	 * ```
	 */
	getFullBlockName(modName?: string, modValue?: unknown): string {
		return this.componentName + (modName != null ? `_${modName.dasherize()}_${String(modValue).dasherize()}` : '');
	}

	/**
	 * Returns CSS selector to the current block
	 *
	 * @param [mods] - map of additional modifiers
	 *
	 * @example
	 * ```js
	 * // .b-foo
	 * this.getBlockSelector();
	 *
	 * // .b-foo.b-foo_focused_true
	 * this.getBlockSelector({focused: true});
	 * ```
	 */
	getBlockSelector(mods?: ModsTable): string {
		let
			res = `.${this.getFullBlockName()}`;

		if (mods) {
			for (let keys = Object.keys(mods), i = 0; i < keys.length; i++) {
				const key = keys[i];
				res += `.${this.getFullBlockName(key, mods[key])}`;
			}
		}

		return res;
	}

	/**
	 * Returns the full name of the specified element
	 *
	 * @param name - element name
	 * @param [modName]
	 * @param [modValue]
	 *
	 * @example
	 * ```js
	 * // .b-foo__bla
	 * this.getFullElName('bla');
	 *
	 * // b-foo__bla_focused_true
	 * this.getBlockSelector('bla', 'focused', true);
	 * ```
	 */
	getFullElName(name: string, modName?: string, modValue?: unknown): string {
		const modStr = modName != null ? `_${modName.dasherize()}_${String(modValue).dasherize()}` : '';
		return `${this.componentName}__${name.dasherize()}${modStr}`;
	}

	/**
	 * Returns CSS selector to the specified element
	 *
	 * @param name - element name
	 * @param [mods] - map of additional modifiers
	 *
	 * @example
	 * ```js
	 * // .$componentId.b-foo__bla
	 * this.getElSelector('bla');
	 *
	 * // .$componentId.b-foo__bla.b-foo__bla_focused_true
	 * this.getElSelector('bla', {focused: true});
	 * ```
	 */
	getElSelector(name: string, mods?: ModsTable): string {
		let
			res = `.${this.componentId}.${this.getFullElName(name)}`;

		if (mods) {
			for (let keys = Object.keys(mods), i = 0; i < keys.length; i++) {
				const key = keys[i];
				res += `.${this.getFullElName(name, key, mods[key])}`;
			}
		}

		return res;
	}

	/**
	 * Returns block child elements by the specified request.
	 * This overload is used to optimize DOM searching.
	 *
	 * @param ctx - context node
	 * @param name - element name
	 * @param [mods] - map of additional modifiers
	 *
	 * @example
	 * ```js
	 * this.elements(node, 'foo');
	 * this.elements(node, 'foo', {focused: true});
	 * ```
	 */
	elements<E extends Element = Element>(ctx: Element, name: string, mods?: ModsTable): NodeListOf<E>;

	/**
	 * Returns block child elements by the specified request
	 *
	 * @param name - element name
	 * @param [mods] - map of additional modifiers
	 *
	 * @example
	 * ```js
	 * this.elements('foo');
	 * this.elements('foo', {focused: true});
	 * ```
	 */
	elements<E extends Element = Element>(name: string, mods?: ModsTable): NodeListOf<E>;
	elements<E extends Element = Element>(
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

		ctx = ctx ?? this.node;

		if (ctx == null) {
			return fakeCtx.querySelectorAll('.loopback');
		}

		return ctx.querySelectorAll(this.getElSelector(elName, mods));
	}

	/**
	 * Returns a block child element by the specified request.
	 * This overload is used to optimize DOM searching.
	 *
	 * @param ctx - context node
	 * @param name - element name
	 * @param [mods] - map of additional modifiers
	 *
	 * @example
	 * ```js
	 * this.element(node, 'foo');
	 * this.element(node, 'foo', {focused: true});
	 * ```
	 */
	element<E extends Element = Element>(ctx: Element, name: string, mods?: ModsTable): CanUndef<E>;

	/**
	 * Returns a block child element by the specified request
	 *
	 * @param name - element name
	 * @param [mods] - map of additional modifiers
	 *
	 * @example
	 * ```js
	 * this.element('foo');
	 * this.element('foo', {focused: true});
	 * ```
	 */
	element<E extends Element = Element>(name: string, mods?: ModsTable): CanUndef<E>;
	element<E extends Element = Element>(
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

		ctx = ctx ?? this.node;

		if (ctx == null) {
			return undefined;
		}

		return ctx.querySelector<E>(this.getElSelector(elName, mods)) ?? undefined;
	}

	/**
	 * Sets a modifier to the current block.
	 * The method returns false if the modifier is already set.
	 *
	 * @param name - modifier name
	 * @param value
	 * @param [reason] - reason to set a modifier
	 *
	 * @example
	 * ```js
	 * this.setMod('focused', true);
	 * this.setMod('focused', true, 'removeMod');
	 * ```
	 */
	setMod(name: string, value: unknown, reason: ModEventReason = 'setMod'): boolean {
		if (value == null) {
			return false;
		}

		name = name.camelize(false);

		const
			{mods, node, ctx} = this;

		const
			normalizedVal = String(value).dasherize(),
			prevVal = this.getMod(name);

		if (prevVal === normalizedVal) {
			return false;
		}

		const
			isInit = reason === 'initSetMod';

		let
			prevValFromDOM,
			needSync = false;

		if (isInit) {
			prevValFromDOM = this.getMod(name, true);
			needSync = prevValFromDOM !== normalizedVal;
		}

		if (needSync) {
			this.removeMod(name, prevValFromDOM, 'initSetMod');

		} else if (!isInit) {
			this.removeMod(name, undefined, 'setMod');
		}

		if (node != null && (!isInit || needSync)) {
			node.classList.add(this.getFullBlockName(name, normalizedVal));
		}

		if (mods != null) {
			mods[name] = normalizedVal;
		}

		ctx.mods[name] = normalizedVal;

		if (!ctx.isFunctional && !ctx.isFlyweight) {
			const
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				watchModsStore = ctx.field?.get<ModsNTable>('watchModsStore');

			if (watchModsStore != null && name in watchModsStore && watchModsStore[name] !== normalizedVal) {
				delete Object.getPrototypeOf(watchModsStore)[name];
				ctx.field.set(`watchModsStore.${name}`, normalizedVal);
			}
		}

		if (!isInit || !ctx.isFlyweight) {
			const event = <SetModEvent>{
				event: 'block.mod.set',
				type: 'set',
				name,
				value: normalizedVal,
				prev: prevVal,
				reason
			};

			this.localEmitter
				.emit(`block.mod.set.${name}.${normalizedVal}`, event);

			if (!isInit) {
				// @deprecated
				ctx.emit(`mod-set-${name}-${normalizedVal}`, event);
				ctx.emit(`mod:set:${name}:${normalizedVal}`, event);
			}
		}

		return true;
	}

	/**
	 * Removes a modifier of the current block.
	 * The method returns false if the block doesn't have this modifier.
	 *
	 * @param name - modifier name
	 * @param [value]
	 * @param [reason] - reason to remove a modifier
	 *
	 * @example
	 * ```js
	 * this.removeMod('focused');
	 * this.removeMod('focused', true);
	 * this.removeMod('focused', true, 'setMod');
	 * ```
	 */
	removeMod(name: string, value?: unknown, reason: ModEventReason = 'removeMod'): boolean {
		name = name.camelize(false);
		value = value != null ? String(value).dasherize() : undefined;

		const
			{mods, node, ctx} = this;

		const
			isInit = reason === 'initSetMod',
			currentVal = this.getMod(name, isInit);

		if (currentVal === undefined || value !== undefined && currentVal !== value) {
			return false;
		}

		if (node != null) {
			node.classList.remove(this.getFullBlockName(name, currentVal));
		}

		if (mods != null) {
			mods[name] = undefined;
		}

		const
			needNotify = reason === 'removeMod';

		if (needNotify) {
			ctx.mods[name] = undefined;

			if (!ctx.isFunctional && !ctx.isFlyweight) {
				const
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					watchModsStore = ctx.field?.get<ModsNTable>('watchModsStore');

				if (watchModsStore != null && name in watchModsStore && watchModsStore[name] != null) {
					delete Object.getPrototypeOf(watchModsStore)[name];
					ctx.field.set(`watchModsStore.${name}`, undefined);
				}
			}
		}

		if (!isInit || !ctx.isFlyweight) {
			const event = <ModEvent>{
				event: 'block.mod.remove',
				type: 'remove',
				name,
				value: currentVal,
				reason
			};

			this.localEmitter
				.emit(`block.mod.remove.${name}.${currentVal}`, event);

			if (needNotify) {
				// @deprecated
				ctx.emit(`mod-remove-${name}-${currentVal}`, event);
				ctx.emit(`mod:remove:${name}:${currentVal}`, event);
			}
		}

		return true;
	}

	/**
	 * Returns a value of the specified block modifier
	 *
	 * @param name - modifier name
	 * @param [fromNode] - if true, then the modifier value will always taken from a dom node
	 *
	 * @example
	 * ```js
	 * this.getMod('focused');
	 * this.getMod('focused', true);
	 * ```
	 */
	getMod(name: string, fromNode?: boolean): CanUndef<string> {
		const
			{mods, node, ctx} = this;

		if (mods && !fromNode) {
			return mods[name.camelize(false)];
		}

		if (!node || !ctx.isFunctional && !ctx.isFlyweight) {
			return undefined;
		}

		const
			MOD_VALUE = 2;

		const
			pattern = `(?:^| )(${this.getFullBlockName(name, '')}[^_ ]*)`,
			rgxp = modRgxpCache[pattern] ?? new RegExp(pattern),
			el = rgxp.exec(node.className);

		modRgxpCache[pattern] = rgxp;
		return el ? el[1].split('_')[MOD_VALUE] : undefined;
	}

	/**
	 * Sets a modifier to the specified element.
	 * The method returns false if the modifier is already set.
	 *
	 * @param link - link to the element
	 * @param elName - element name
	 * @param modName
	 * @param value
	 * @param [reason] - reason to set a modifier
	 *
	 * @example
	 * ```js
	 * this.setElMod(node, 'foo', 'focused', true);
	 * this.setElMod(node, 'foo', 'focused', true, 'initSetMod');
	 * ```
	 */
	setElMod(
		link: Nullable<Element>,
		elName: string,
		modName: string,
		value: unknown,
		reason: ModEventReason = 'setMod'
	): boolean {
		if (!link || value == null) {
			return false;
		}

		elName = elName.camelize(false);
		modName = modName.camelize(false);

		const
			normalizedVal = String(value).dasherize();

		if (this.getElMod(link, elName, modName) === normalizedVal) {
			return false;
		}

		this.removeElMod(link, elName, modName, undefined, 'setMod');
		link.classList.add(this.getFullElName(elName, modName, normalizedVal));

		const event = <SetElementModEvent>{
			element: elName,
			event: 'el.mod.set',
			type: 'set',
			link,
			modName,
			value: normalizedVal,
			reason
		};

		this.localEmitter.emit(`el.mod.set.${elName}.${modName}.${normalizedVal}`, event);
		return true;
	}

	/**
	 * Removes a modifier from the specified element.
	 * The method returns false if the element doesn't have this modifier.
	 *
	 * @param link - link to the element
	 * @param elName - element name
	 * @param modName
	 * @param [value]
	 * @param [reason] - reason to remove a modifier
	 *
	 * @example
	 * ```js
	 * this.removeElMod(node, 'foo', 'focused');
	 * this.removeElMod(node, 'foo', 'focused', true);
	 * this.removeElMod(node, 'foo', 'focused', true, 'setMod');
	 * ```
	 */
	removeElMod(
		link: Nullable<Element>,
		elName: string,
		modName: string,
		value?: unknown,
		reason: ModEventReason = 'removeMod'
	): boolean {
		if (!link) {
			return false;
		}

		elName = elName.camelize(false);
		modName = modName.camelize(false);

		const
			normalizedVal = value != null ? String(value).dasherize() : undefined,
			currentVal = this.getElMod(link, elName, modName);

		if (currentVal === undefined || normalizedVal !== undefined && currentVal !== normalizedVal) {
			return false;
		}

		link.classList
			.remove(this.getFullElName(elName, modName, currentVal));

		const event = <ElementModEvent>{
			element: elName,
			event: 'el.mod.remove',
			type: 'remove',
			link,
			modName,
			value: currentVal,
			reason
		};

		this.localEmitter.emit(`el.mod.remove.${elName}.${modName}.${currentVal}`, event);
		return true;
	}

	/**
	 * Returns a value of a modifier from the specified element
	 *
	 * @param link - link to the element
	 * @param elName - element name
	 * @param modName - modifier name
	 */
	getElMod(link: Nullable<Element>, elName: string, modName: string): CanUndef<string> {
		if (!link) {
			return undefined;
		}

		const
			MOD_VALUE = 3;

		const
			pattern = `(?:^| )(${this.getFullElName(elName, modName, '')}[^_ ]*)`,
			rgxp = pattern[pattern] ?? new RegExp(pattern),
			el = rgxp.exec(link.className);

		modRgxpCache[pattern] = rgxp;
		return el != null ? el[1].split(elRxp)[MOD_VALUE] : undefined;
	}
}
