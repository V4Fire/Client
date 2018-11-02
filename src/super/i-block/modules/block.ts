/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock, { VueElement, ModsTable } from 'super/i-block/i-block';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

export type EventType =
	'set' |
	'remove';

export type EventName =
	'block.mod.set' |
	'block.mod.remove' |
	'el.mod.set' |
	'el.mod.remove';

export type EventReason =
	'initSetMod' |
	'setMod' |
	'removeMod';

export interface Event {
	event: EventName;
	type: EventType;
	reason: EventReason;
	name: string;
	value: string;
}

export interface SetEvent extends Event {
	prev: string | undefined;
}

export interface ElementEvent {
	event: EventName;
	type: EventType;
	reason: EventReason;
	element: string;
	link: HTMLElement;
	modName: string;
	value: string;
}

export interface SetElementEvent extends ElementEvent {
	prev: string | undefined;
}

/**
 * Base class for BEM like develop
 */
export default class Block {
	/**
	 * Current block id
	 */
	get blockId(): string {
		return this.component.componentId;
	}

	/**
	 * Current block name
	 */
	get blockName(): string {
		return this.component.componentName;
	}

	/**
	 * Link to a block node
	 */
	get node(): VueElement<unknown> {
		return this.component.$el;
	}

	/**
	 * Local event emitter
	 */
	get event(): EventEmitter {
		// @ts-ignore
		return this.component.localEvent;
	}

	/**
	 * List of applied modifiers
	 */
	readonly mods?: Dictionary<string | undefined>;

	/**
	 * iBlock instance
	 */
	readonly component: iBlock;

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
		return this.blockName + (modName ? `_${modName.dasherize()}_${String(modValue).dasherize()}` : '');
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
		return `${this.blockName}__${elName.dasherize()}${modStr}`;
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
			res = `${sel}.${this.blockId}`;

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
		return this.node.querySelectorAll(this.getElSelector(elName, mods));
	}

	/**
	 * Returns a child element by the specified request
	 *
	 * @param elName
	 * @param [mods]
	 */
	element<E extends Element = Element>(elName: string, mods?: ModsTable): E | null {
		return this.node.querySelector(this.getElSelector(elName, mods));
	}

	/**
	 * Sets a block modifier
	 *
	 * @param name
	 * @param value
	 * @param [reason]
	 */
	setMod(name: string, value: unknown, reason: EventReason = 'setMod'): boolean {
		if (value === undefined) {
			return false;
		}

		name = name.camelize(false);
		value = String(value).dasherize();

		const
			prev = this.getMod(name);

		if (prev !== value) {
			this.removeMod(name, undefined, 'setMod');

			if (this.mods) {
				this.mods[name] = <string>value;
			}

			if (reason !== 'initSetMod') {
				this.node.classList.add(this.getFullBlockName(name, value));
			}

			const event = <SetEvent>{
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
	removeMod(name: string, value?: unknown, reason: EventReason = 'removeMod'): boolean {
		name = name.camelize(false);
		value = value !== undefined ? String(value).dasherize() : undefined;

		const
			current = this.getMod(name);

		if (current !== undefined && (value === undefined || current === value)) {
			if (this.mods) {
				this.mods[name] = undefined;
			}

			this.node.classList.remove(
				this.getFullBlockName(name, current)
			);

			const event = <Event>{
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
	 * @param mod
	 */
	getMod(mod: string): string | undefined {
		if (this.mods) {
			return this.mods[mod.camelize(false)];
		}

		const
			MOD_VALUE = 2;

		const
			rgxp = new RegExp(`(?:^| )(${this.getFullBlockName(mod, '')}[^_ ]*)`),
			el = rgxp.exec(this.node.className);

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
	setElMod(link: Element, elName: string, modName: string, value: unknown, reason: EventReason = 'setMod'): boolean {
		if (value === undefined) {
			return false;
		}

		elName = elName.camelize(false);
		modName = modName.camelize(false);
		value = String(value).dasherize();

		if (this.getElMod(link, elName, modName) !== value) {
			this.removeElMod(link, elName, modName, undefined, 'setMod');
			link.classList.add(this.getFullElName(elName, modName, value));

			const event = <SetElementEvent>{
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
		link: Element,
		elName: string,
		modName: string,
		value?: unknown,
		reason: EventReason = 'removeMod'
	): boolean {
		elName = elName.camelize(false);
		modName = modName.camelize(false);
		value = value !== undefined ? String(value).dasherize() : undefined;

		const
			current = this.getElMod(link, elName, modName);

		if (current !== undefined && (value === undefined || current === value)) {
			link.classList.remove(this.getFullElName(elName, modName, current));

			const event = <ElementEvent>{
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
	getElMod(link: Element, elName: string, modName: string): string | undefined {
		const
			MOD_VALUE = 3;

		const
			rgxp = new RegExp(`(?:^| )(${this.getFullElName(elName, modName, '')}[^_ ]*)`),
			el = rgxp.exec(link.className);

		return el ? el[1].split(/_+/)[MOD_VALUE] : undefined;
	}
}
