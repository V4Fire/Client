/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock, { ComponentElement, ModsTable } from 'super/i-block/i-block';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

export type ModEventType =
	'set' |
	'remove';

export type ModEventName =
	'block.mod.set' |
	'block.mod.remove' |
	'el.mod.set' |
	'el.mod.remove';

export type ModEventReason =
	'initSetMod' |
	'setMod' |
	'removeMod';

export interface ModEvent {
	event: ModEventName;
	type: ModEventType;
	reason: ModEventReason;
	name: string;
	value: string;
}

export interface SetModEvent extends ModEvent {
	prev: CanUndef<string>;
}

export interface ElementModEvent {
	event: ModEventName;
	type: ModEventType;
	reason: ModEventReason;
	element: string;
	link: HTMLElement;
	modName: string;
	value: string;
}

export interface SetElementModEvent extends ElementModEvent {
	prev: CanUndef<string>;
}

/**
 * Base class for BEM like develop
 */
export default class Block {
	/**
	 * Current block id
	 */
	get id(): string {
		return this.component.componentId;
	}

	/**
	 * Current block name
	 */
	get name(): string {
		return this.component.componentName;
	}

	/**
	 * Link to a block node
	 */
	get node(): CanUndef<ComponentElement<unknown>> {
		return this.component.$el;
	}

	/**
	 * Local event emitter
	 */
	protected get event(): EventEmitter {
		// @ts-ignore
		return this.component.localEvent;
	}

	/**
	 * List of applied modifiers
	 */
	protected readonly mods?: Dictionary<CanUndef<string>>;

	/**
	 * iBlock instance
	 */
	protected readonly component: iBlock;

	/**
	 * @param component - component instance
	 */
	constructor(component: iBlock) {
		this.component = component;
		this.mods = Object.createDict();

		for (let m = component.mods, keys = Object.keys(m), i = 0; i < keys.length; i++) {
			const name = keys[i];
			this.setMod(name, m[name], 'initSetMod');
		}
	}

	/**
	 * Returns an array of component classes by the specified parameters
	 *
	 * @param [componentName] - name of the source component
	 * @param mods - map of modifiers
	 */
	getBlockClasses(componentName: CanUndef<string>, mods: ModsTable): ReadonlyArray<string>;

	/**
	 * @param mods - map of modifiers
	 */
	getBlockClasses(mods: ModsTable): ReadonlyArray<string>;
	getBlockClasses(componentName?: string | ModsTable, mods?: ModsTable): ReadonlyArray<string> {
		if (arguments.length === 1) {
			mods = <ModsTable>componentName;
			componentName = undefined;

		} else {
			mods = <ModsTable>mods;
			componentName = <CanUndef<string>>componentName;
		}

		const
			key = JSON.stringify(mods) + componentName,
			cache = classesCache.create('blocks', this.componentName);

		if (cache[key]) {
			return <ReadonlyArray<string>>cache[key];
		}

		const
			classes = cache[key] = [this.getFullBlockName(componentName)];

		for (let keys = Object.keys(mods), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				val = mods[key];

			if (val !== undefined) {
				classes.push(this.getFullBlockName(componentName, key, val));
			}
		}

		return classes;
	}

	/**
	 * Returns an array of element classes by the specified parameters
	 *
	 * @param componentNameOrCtx
	 * @param els - map of elements with map of modifiers ({button: {focused: true}})
	 */
	protected getElClasses(componentNameOrCtx: string | iBlock, els: Dictionary<ModsTable>): ReadonlyArray<string>;

	/**
	 * @param els - map of elements with map of modifiers ({button: {focused: true}})
	 */
	protected getElClasses(els: Dictionary<ModsTable>): ReadonlyArray<string>;
	protected getElClasses(
		componentNameOrCtx: string | iBlock | Dictionary<ModsTable>,
		els?: Dictionary<ModsTable>
	): ReadonlyArray<string> {
		let
			id,
			componentName;

		if (arguments.length === 1) {
			id = this.componentId;
			componentName = this.componentName;
			els = <Dictionary<ModsTable>>componentNameOrCtx;

		} else {
			if (Object.isString(componentNameOrCtx)) {
				componentName = componentNameOrCtx;

			} else {
				id = (<iBlock>componentNameOrCtx).componentId;
				componentName = (<iBlock>componentNameOrCtx).componentName;
			}
		}

		if (!els) {
			return Object.freeze([]);
		}

		const
			key = JSON.stringify(els),
			cache = classesCache.create('els', id || componentName);

		if (cache[key]) {
			return <ReadonlyArray<string>>cache[key];
		}

		const
			classes = cache[key] = id ? [id] : [];

		for (let keys = Object.keys(els), i = 0; i < keys.length; i++) {
			const
				el = keys[i],
				mods = els[el];

			classes.push(
				this.getFullElName(<string>componentName, el)
			);

			if (!Object.isObject(mods)) {
				continue;
			}

			for (let keys = Object.keys(mods), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					val = mods[key];

				if (val !== undefined) {
					classes.push(this.getFullElName(<string>componentName, el, key, val));
				}
			}
		}

		return Object.freeze(classes);
	}

	/**
	 * Returns true if the block has all modifiers from specified
	 *
	 * @param mods - list of modifiers (['name', ['name', 'value']])
	 * @param [value] - value of modifiers
	 */
	ifEveryMods(mods: Array<CanArray<string>>, value?: unknown): boolean {
		for (let i = 0; i < mods.length; i++) {
			const
				el = mods[i];

			if (Object.isArray(el)) {
				if (this.getMod(el[0]) === String(el[1])) {
					continue;
				}

				return false;
			}

			if (this.getMod(el) === String(value)) {
				continue;
			}

			return false;
		}

		return true;
	}

	/**
	 * Returns true if the block has at least one modifier from specified
	 *
	 * @param mods - list of modifiers (['name', ['name', 'value']])
	 * @param [value] - value of modifiers
	 */
	ifSomeMod(mods: Array<CanArray<string>>, value?: unknown): boolean {
		for (let i = 0; i < mods.length; i++) {
			const
				el = mods[i];

			if (Object.isArray(el)) {
				if (this.getMod(el[0]) === String(el[1])) {
					return true;
				}

				continue;
			}

			if (this.getMod(el) === String(value)) {
				return true;
			}
		}

		return false;
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
	 * Returns a full name of the specified element
	 *
	 * @param elName
	 * @param [modName]
	 * @param [modValue]
	 */
	getFullElName(elName: string, modName?: string, modValue?: unknown): string {
		const modStr = modName ? `_${modName.dasherize()}_${String(modValue).dasherize()}` : '';
		return `${this.name}__${elName.dasherize()}${modStr}`;
	}

	/**
	 * Returns CSS selector for the specified element
	 *
	 * @param elName
	 * @param [mods]
	 */
	getElSelector(elName: string, mods?: ModsTable): string {
		const
			sel = `.${this.getFullElName(elName)}`;

		let
			res = `${sel}.${this.id}`;

		if (mods) {
			for (let keys = Object.keys(mods), i = 0; i < keys.length; i++) {
				const name = keys[i];
				res += `${sel}_${name}_${mods[name]}`;
			}
		}

		return res;
	}

	/**
	 * Returns block child elements by the specified request
	 *
	 * @param elName
	 * @param [mods]
	 */
	elements<E extends Element = Element>(elName: string, mods?: ModsTable): NodeListOf<E> {
		const
			{node} = this;

		if (!node) {
			return document.createElement('div').querySelectorAll('loopback');
		}

		return node.querySelectorAll(this.getElSelector(elName, mods));
	}

	/**
	 * Returns a child element by the specified request
	 *
	 * @param elName
	 * @param [mods]
	 */
	element<E extends Element = Element>(elName: string, mods?: ModsTable): CanUndef<E> {
		const
			{node} = this;

		if (!node) {
			return undefined;
		}

		return node.querySelector<E>(this.getElSelector(elName, mods)) || undefined;
	}

	/**
	 * Sets a block modifier
	 *
	 * @param name
	 * @param value
	 * @param [reason]
	 */
	setMod(name: string, value: unknown, reason: ModEventReason = 'setMod'): boolean {
		if (value === undefined) {
			return false;
		}

		name = name.camelize(false);
		value = String(value).dasherize();

		const
			{mods, node} = this;

		const
			initSetMod = reason === 'initSetMod',
			prev = this.getMod(name);

		if (prev !== value) {
			let
				domPrev,
				needSync = false;

			if (initSetMod) {
				domPrev = this.getMod(name, true);
				needSync = domPrev !== value;
			}

			if (needSync) {
				this.removeMod(name, domPrev, 'initSetMod');

			} else if (!initSetMod) {
				this.removeMod(name, undefined, 'setMod');
			}

			if (mods) {
				mods[name] = <string>value;
			}

			if (node && (!initSetMod || needSync)) {
				node.classList.add(this.getFullBlockName(name, value));
			}

			const event = <SetModEvent>{
				event: 'block.mod.set',
				type: 'set',
				name,
				value,
				prev,
				reason
			};

			this.event.emit(`block.mod.set.${name}.${value}`, event);
			return true;
		}

		return false;
	}

	/**
	 * Removes a block modifier
	 *
	 * @param name
	 * @param [value]
	 * @param [reason]
	 */
	removeMod(name: string, value?: unknown, reason: ModEventReason = 'removeMod'): boolean {
		name = name.camelize(false);
		value = value !== undefined ? String(value).dasherize() : undefined;

		const
			{mods, node} = this,
			current = this.getMod(name, reason === 'initSetMod');

		if (current !== undefined && (value === undefined || current === value)) {
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

			this.event.emit(`block.mod.remove.${name}.${current}`, event);
			return true;
		}

		return false;
	}

	/**
	 * Returns a value of the specified block modifier
	 *
	 * @param mod
	 * @param [strict] - if true, then the modifier value will always taken from a dom node
	 */
	getMod(mod: string, strict?: boolean): CanUndef<string> {
		const
			{mods, node} = this;

		if (mods && !strict) {
			return mods[mod.camelize(false)];
		}

		if (!node) {
			return undefined;
		}

		const
			MOD_VALUE = 2;

		const
			rgxp = new RegExp(`(?:^| )(${this.getFullBlockName(mod, '')}[^_ ]*)`),
			el = rgxp.exec(node.className);

		return el ? el[1].split('_')[MOD_VALUE] : undefined;
	}

	/**
	 * Sets a modifier to the specified element
	 *
	 * @param link - link to the element
	 * @param elName
	 * @param modName
	 * @param value
	 * @param [reason]
	 */
	setElMod(
		link: Nullable<Element>,
		elName: string,
		modName: string,
		value: unknown,
		reason: ModEventReason = 'setMod'
	): boolean {
		if (!link || value === undefined) {
			return false;
		}

		elName = elName.camelize(false);
		modName = modName.camelize(false);
		value = String(value).dasherize();

		if (this.getElMod(link, elName, modName) !== value) {
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

			this.event.emit(`el.mod.set.${elName}.${modName}.${value}`, event);
			return true;
		}

		return false;
	}

	/**
	 * Removes a modifier from the specified element
	 *
	 * @param link - link to the element
	 * @param elName
	 * @param modName
	 * @param [value]
	 * @param [reason]
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
		value = value !== undefined ? String(value).dasherize() : undefined;

		const
			current = this.getElMod(link, elName, modName);

		if (current !== undefined && (value === undefined || current === value)) {
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

			this.event.emit(`el.mod.remove.${elName}.${modName}.${current}`, event);
			return true;
		}

		return false;
	}

	/**
	 * Returns a value of a modifier from the specified element
	 *
	 * @param link - link to the element
	 * @param elName
	 * @param modName
	 */
	getElMod(link: Nullable<Element>, elName: string, modName: string): CanUndef<string> {
		if (!link) {
			return undefined;
		}

		const
			MOD_VALUE = 3;

		const
			rgxp = new RegExp(`(?:^| )(${this.getFullElName(elName, modName, '')}[^_ ]*)`),
			el = rgxp.exec(link.className);

		return el ? el[1].split(/_+/)[MOD_VALUE] : undefined;
	}
}
