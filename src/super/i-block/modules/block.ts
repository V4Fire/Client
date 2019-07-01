/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';
import { Event } from 'super/i-block/modules/event';
import { ModsTable, ModsNTable } from 'super/i-block/modules/mods';
import { ComponentElement } from 'core/component';

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

const
	modRgxpCache = Object.createDict<RegExp>(),
	elRxp = /_+/;

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
	protected get event(): Event {
		// @ts-ignore
		return this.component.localEvent;
	}

	/**
	 * List of applied modifiers
	 */
	protected readonly mods?: Dictionary<CanUndef<string>>;

	/**
	 * Component instance
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
	 * @param ctx - context node
	 * @param elName
	 * @param [mods]
	 */
	elements<E extends Element = Element>(ctx: Element, elName: string, mods?: ModsTable): NodeListOf<E>;

	/**
	 * @param elName
	 * @param [mods]
	 */
	elements<E extends Element = Element>(elName: string, mods?: ModsTable): NodeListOf<E>;
	elements<E extends Element = Element>(
		ctx: Element | string,
		elName?: string | ModsTable,
		mods?: ModsTable
	): NodeListOf<E> {
		if (Object.isString(ctx)) {
			mods = <ModsTable>elName;
			elName = ctx;
			ctx = <Element>this.node;

		} else {
			ctx = ctx || this.node;
		}

		if (!ctx) {
			return document.createElement('div').querySelectorAll('loopback');
		}

		return ctx.querySelectorAll(this.getElSelector(<string>elName, mods));
	}

	/**
	 * Returns a child element by the specified request
	 *
	 * @param ctx - context node
	 * @param elName
	 * @param [mods]
	 */
	element<E extends Element = Element>(ctx: Element, elName: string, mods?: ModsTable): CanUndef<E>;

	/**
	 * @param elName
	 * @param [mods]
	 */
	element<E extends Element = Element>(elName: string, mods?: ModsTable): CanUndef<E>;
	element<E extends Element = Element>(
		ctx: Element | string,
		elName?: string | ModsTable,
		mods?: ModsTable
	): CanUndef<E> {
		if (Object.isString(ctx)) {
			mods = <ModsTable>elName;
			elName = ctx;
			ctx = <Element>this.node;

		} else {
			ctx = ctx || this.node;
		}

		if (!ctx) {
			return undefined;
		}

		return ctx.querySelector<E>(this.getElSelector(<string>elName, mods)) || undefined;
	}

	/**
	 * Sets a block modifier
	 *
	 * @param name
	 * @param value
	 * @param [reason]
	 */
	setMod(name: string, value: unknown, reason: ModEventReason = 'setMod'): boolean {
		if (value == null) {
			return false;
		}

		name = name.camelize(false);
		value = String(value).dasherize();

		const
			{mods, node, component: c} = this;

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

			if (c.field) {
				const watchModsStore = <NonNullable<ModsNTable>>c.field.get('watchModsStore');
				c.mods[name] = <string>value;

				if (name in watchModsStore && watchModsStore[name] !== value) {
					delete watchModsStore[name];
					c.field.set(`watchModsStore.${name}`, value);
				}

				this.event.emit(`block.mod.set.${name}.${value}`, event);
				c.emit(`mod-set-${name}-${value}`, event);

			} else {
				this.event.emit(`block.mod.set.${name}.${value}`, event);
			}

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
		value = value != null ? String(value).dasherize() : undefined;

		const
			{mods, node, component: c} = this,
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

			if (reason === 'removeMod' && c.field) {
				const watchModsStore = <NonNullable<ModsNTable>>c.field.get('watchModsStore');
				c.mods[name] = undefined;

				if (name in watchModsStore && watchModsStore[name]) {
					delete watchModsStore[name];
					c.field.set(`watchModsStore.${name}`, undefined);
				}

				this.event.emit(`block.mod.remove.${name}.${current}`, event);
				c.emit(`mod-remove-${name}-${current}`, event);

			} else {
				this.event.emit(`block.mod.remove.${name}.${current}`, event);
			}

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
			{mods, node, component: c} = this;

		if (mods && !strict) {
			return mods[mod.camelize(false)];
		}

		if (!node || !c.isFlyweight && !c.isFunctional) {
			return undefined;
		}

		const
			MOD_VALUE = 2;

		const
			pattern = `(?:^| )(${this.getFullBlockName(mod, '')}[^_ ]*)`,
			rgxp = modRgxpCache[pattern] = modRgxpCache[pattern] || new RegExp(pattern),
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
		if (!link || value == null) {
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
		value = value != null ? String(value).dasherize() : undefined;

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
			pattern = `(?:^| )(${this.getFullElName(elName, modName, '')}[^_ ]*)`,
			rgxp = modRgxpCache[pattern] = pattern[pattern] || new RegExp(pattern),
			el = rgxp.exec(link.className);

		return el ? el[1].split(elRxp)[MOD_VALUE] : undefined;
	}
}
