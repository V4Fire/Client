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

import iBlock from 'super/i-block/i-block';
import Friend from 'super/i-block/modules/friend';

import { ModsTable, ModsNTable } from 'super/i-block/modules/mods';
import {

	ModEvent,
	ModEventReason,
	SetModEvent,

	ElementModEvent,
	SetElementModEvent

} from 'super/i-block/modules/block/interface';

export * from 'super/i-block/modules/block/interface';

const
	fakeCtx = document.createElement('div'),
	modRgxpCache = Object.createDict<RegExp>(),
	elRxp = /_+/;

/**
 * Class that implements BEM-like API
 */
export default class Block<C extends iBlock = iBlock> extends Friend<C> {
	/** @see [[iBlock.componentId]] */
	get id(): string {
		return this.component.componentId;
	}

	/** @see [[iBlock.componentName]] */
	get name(): string {
		return this.component.componentName;
	}

	/** @see [[iBlock.$el]] */
	get node(): this['C']['$el'] {
		return this.component.$el;
	}

	/**
	 * Map of applied modifiers
	 */
	protected readonly mods?: Dictionary<CanUndef<string>>;

	/** @override */
	constructor(component: C) {
		super(component);
		this.mods = Object.createDict();

		for (let m = component.mods, keys = Object.keys(m), i = 0; i < keys.length; i++) {
			const name = keys[i];
			this.setMod(name, m[name], 'initSetMod');
		}
	}

	/**
	 * Returns a full name of the current block
	 *
	 * @param [modName]
	 * @param [modValue]
	 */
	getFullBlockName(modName?: string, modValue?: unknown): string {
		return this.name + (modName ? `_${modName.dasherize()}_${String(modValue).dasherize()}` : '');
	}

	/**
	 * Returns CSS selector to the current block
	 * @param [mods] - map of additional modifiers
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
	 * Returns a full name of the specified element
	 *
	 * @param name - element name
	 * @param [modName]
	 * @param [modValue]
	 */
	getFullElName(name: string, modName?: string, modValue?: unknown): string {
		const modStr = modName ? `_${modName.dasherize()}_${String(modValue).dasherize()}` : '';
		return `${this.name}__${name.dasherize()}${modStr}`;
	}

	/**
	 * Returns CSS selector to the specified element
	 *
	 * @param name - element name
	 * @param [mods] - map of additional modifiers
	 */
	getElSelector(name: string, mods?: ModsTable): string {
		let
			res = `.${this.id}.${this.getFullElName(name)}`;

		if (mods) {
			for (let keys = Object.keys(mods), i = 0; i < keys.length; i++) {
				const key = keys[i];
				res += `.${this.getFullElName(name, key, mods[key])}`;
			}
		}

		return res;
	}

	/**
	 * Returns block child elements by the specified request
	 *
	 * @param ctx - context node
	 * @param name - element name
	 * @param [mods] - map of additional modifiers
	 */
	elements<E extends Element = Element>(ctx: Element, name: string, mods?: ModsTable): NodeListOf<E>;

	/**
	 * @param name - element name
	 * @param [mods] - map of additional modifiers
	 */
	elements<E extends Element = Element>(name: string, mods?: ModsTable): NodeListOf<E>;
	elements<E extends Element = Element>(
		ctx: Element | string,
		name?: string | ModsTable,
		mods?: ModsTable
	): NodeListOf<E> {
		let
			elName;

		if (Object.isString(ctx)) {
			mods = <ModsTable>name;
			elName = ctx;
			ctx = this.node;

		} else {
			elName = name;
			ctx = ctx || this.node;
		}

		if (!ctx) {
			return fakeCtx.querySelectorAll('loopback');
		}

		return ctx.querySelectorAll(this.getElSelector(elName, mods));
	}

	/**
	 * Returns a block child element by the specified request
	 *
	 * @param ctx - context node
	 * @param name - element name
	 * @param [mods] - map of additional modifiers
	 */
	element<E extends Element = Element>(ctx: Element, name: string, mods?: ModsTable): CanUndef<E>;

	/**
	 * @param name - element name
	 * @param [mods] - map of additional modifiers
	 */
	element<E extends Element = Element>(name: string, mods?: ModsTable): CanUndef<E>;
	element<E extends Element = Element>(
		ctx: Element | string,
		name?: string | ModsTable,
		mods?: ModsTable
	): CanUndef<E> {
		let
			elName;

		if (Object.isString(ctx)) {
			mods = <ModsTable>name;
			elName = ctx;
			ctx = this.node;

		} else {
			elName = name;
			ctx = ctx || this.node;
		}

		if (!ctx) {
			return undefined;
		}

		return ctx.querySelector<E>(this.getElSelector(elName, mods)) || undefined;
	}

	/**
	 * Sets a modifier to the current block
	 *
	 * @param name - modifier name
	 * @param value
	 * @param [reason] - reason to set a modifier
	 */
	setMod(name: string, value: unknown, reason: ModEventReason = 'setMod'): boolean {
		if (value == null) {
			return false;
		}

		name = name.camelize(false);

		const
			{mods, node, component} = this;

		const
			normalizedVal = String(value).dasherize(),
			initSetMod = reason === 'initSetMod',
			prev = this.getMod(name);

		if (prev === normalizedVal) {
			return false;
		}

		let
			domPrev,
			needSync = false;

		if (initSetMod) {
			domPrev = this.getMod(name, true);
			needSync = domPrev !== normalizedVal;
		}

		if (needSync) {
			this.removeMod(name, domPrev, 'initSetMod');

		} else if (!initSetMod) {
			this.removeMod(name, undefined, 'setMod');
		}

		if (mods) {
			mods[name] = normalizedVal;
		}

		if (node && (!initSetMod || needSync)) {
			node.classList.add(this.getFullBlockName(name, normalizedVal));
		}

		const event = <SetModEvent>{
			event: 'block.mod.set',
			type: 'set',
			name,
			value,
			prev,
			reason
		};

		if (component.field) {
			const watchModsStore = component.field.get<ModsNTable>('watchModsStore')!;
			component.mods[name] = normalizedVal;

			if (name in watchModsStore && watchModsStore[name] !== normalizedVal) {
				delete Object.getPrototypeOf(watchModsStore)[name];
				component.field.set(`watchModsStore.${name}`, normalizedVal);
			}

			this.localEmitter.emit(`block.mod.set.${name}.${normalizedVal}`, event);
			component.emit(`mod-set-${name}-${normalizedVal}`, event);

		} else {
			this.localEmitter.emit(`block.mod.set.${name}.${normalizedVal}`, event);
		}

		return true;
	}

	/**
	 * Removes a modifier of the current block
	 *
	 * @param name - modifier name
	 * @param [value]
	 * @param [reason] - reason to remove a modifier
	 */
	removeMod(name: string, value?: unknown, reason: ModEventReason = 'removeMod'): boolean {
		name = name.camelize(false);
		value = value != null ? String(value).dasherize() : undefined;

		const
			{mods, node, component} = this;

		const
			current = this.getMod(name, reason === 'initSetMod');

		if (current === undefined || value !== undefined && current !== value) {
			return false;
		}

		if (mods) {
			mods[name] = undefined;
		}

		if (node) {
			node.classList.remove(this.getFullBlockName(name, current));
		}

		const event = <ModEvent>{
			event: 'block.mod.remove',
			type: 'remove',
			name,
			value: current,
			reason
		};

		if (reason === 'removeMod' && component.field) {
			const watchModsStore = component.field.get<ModsNTable>('watchModsStore')!;
			component.mods[name] = undefined;

			if (name in watchModsStore && watchModsStore[name]) {
				delete Object.getPrototypeOf(watchModsStore)[name];
				component.field.set(`watchModsStore.${name}`, undefined);
			}

			this.localEmitter.emit(`block.mod.remove.${name}.${current}`, event);
			component.emit(`mod-remove-${name}-${current}`, event);

		} else {
			this.localEmitter.emit(`block.mod.remove.${name}.${current}`, event);
		}

		return true;
	}

	/**
	 * Returns a value of the specified block modifier
	 *
	 * @param name - modifier name
	 * @param [fromNode] - if true, then the modifier value will always taken from a dom node
	 */
	getMod(name: string, fromNode?: boolean): CanUndef<string> {
		const
			{mods, node, component} = this;

		if (mods && !fromNode) {
			return mods[name.camelize(false)];
		}

		if (!node || !component.isFlyweight && !component.isFunctional) {
			return undefined;
		}

		const
			MOD_VALUE = 2;

		const
			pattern = `(?:^| )(${this.getFullBlockName(name, '')}[^_ ]*)`,
			rgxp = modRgxpCache[pattern] = modRgxpCache[pattern] || new RegExp(pattern),
			el = rgxp.exec(node.className);

		return el ? el[1].split('_')[MOD_VALUE] : undefined;
	}

	/**
	 * Sets a modifier to the specified element
	 *
	 * @param link - link to the element
	 * @param elName - element name
	 * @param modName
	 * @param value
	 * @param [reason] - reason to set a modifier
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
		value = String(value).dasherize();

		if (this.getElMod(link, elName, modName) === value) {
			return false;
		}

		this.removeElMod(link, elName, modName, undefined, 'setMod');
		link.classList.add(this.getFullElName(elName, modName, value));

		const event = <SetElementModEvent>{
			element: elName,
			event: 'el.mod.set',
			type: 'set',
			link,
			modName,
			value,
			reason
		};

		this.localEmitter.emit(`el.mod.set.${elName}.${modName}.${value}`, event);
		return true;
	}

	/**
	 * Removes a modifier from the specified element
	 *
	 * @param link - link to the element
	 * @param elName - element name
	 * @param modName
	 * @param [value]
	 * @param [reason] - reason to remove a modifier
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
		value = value != null ? String(value).dasherize() : undefined;

		const
			current = this.getElMod(link, elName, modName);

		if (current === undefined || value !== undefined && current !== value) {
			return false;
		}

		link.classList.remove(this.getFullElName(elName, modName, current));

		const event = <ElementModEvent>{
			element: elName,
			event: 'el.mod.remove',
			type: 'remove',
			link,
			modName,
			value: current,
			reason
		};

		this.localEmitter.emit(`el.mod.remove.${elName}.${modName}.${current}`, event);
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
			rgxp = modRgxpCache[pattern] = pattern[pattern] || new RegExp(pattern),
			el = rgxp.exec(link.className);

		return el ? el[1].split(elRxp)[MOD_VALUE] : undefined;
	}
}
