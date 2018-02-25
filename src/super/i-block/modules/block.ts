/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import $C = require('collection.js');
import Async from 'core/async';
import iBlock, { VueElement } from 'super/i-block/i-block';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

/**
 * Enum of available block statuses
 */
export enum statuses {
	destroyed = -1,
	inactive = 0,
	loading = 1,
	ready = 2,
	unloaded = 0
}

/**
 * Base class for BEM like develop
 */
export default class Block<T extends iBlock> {
	/**
	 * Block unique id
	 */
	readonly id: string;

	/**
	 * Link to a block node
	 */
	readonly node: VueElement<T>;

	/**
	 * Block model
	 */
	readonly model: T;

	/**
	 * Async object
	 */
	async: Async<T>;

	/**
	 * Local event emitter
	 */
	readonly localEvent: EventEmitter;

	/**
	 * List of applied modifiers
	 */
	readonly mods: Dictionary<string | undefined>;

	/**
	 * Map of available block statuses
	 */
	readonly statuses: typeof statuses = statuses;

	/**
	 * Block init status
	 */
	protected blockStatus: number = statuses.unloaded;

	/**
	 * Sets a new status to the current block
	 * @param value
	 */
	set status(value: number) {
		if (this.blockStatus === value) {
			return;
		}

		this.blockStatus = value = value in this.statuses ? value : 0;

		const
			stringStatus = this.statuses[value];

		// @ts-ignore
		this.model.blockStatus = stringStatus;
		this.localEvent.emit(`block.status.${stringStatus}`, value);
		this.model.emit(`status-${stringStatus}`, value);
	}

	/**
	 * Current block status
	 */
	get status(): number {
		return this.blockStatus;
	}

	/**
	 * Current block name
	 */
	get blockName(): string {
		return this.model.componentName;
	}

	/**
	 * @param id - block id
	 * @param node - link to a block node
	 * @param mods - map of modifiers to apply
	 * @param async - instance of Async
	 * @param localEvent - instance of EventEmitter2
	 * @param model - model instance (Vue.js)
	 */
	constructor(
		{id, node, mods, async, localEvent, model}: {
			id: string;
			node: HTMLElement;
			mods: Dictionary<string | undefined>;
			async: Async<T>;
			localEvent: EventEmitter;
			model: T;
		}
	) {
		this.id = id;
		this.async = async;
		this.localEvent = localEvent;

		this.mods = Object.createDict();
		this.model = model;

		this.node = node;
		this.node.classList.add(this.blockName, 'i-block-helper');

		this.localEvent.once('block.status.loading', () => {
			for (let keys = Object.keys(mods), i = 0; i < keys.length; i++) {
				const name = keys[i];
				this.setMod(name, mods[name]);
			}
		});

		this.status = this.statuses.loading;
	}

	destructor(): void {
		this.status = this.statuses.destroyed;
		this.async.clearAll();
		this.localEvent.removeAllListeners();
	}

	/**
	 * Returns a full name of the current block
	 *
	 * @param [modName]
	 * @param [modValue]
	 */
	getFullBlockName(modName?: string, modValue?: any): string {
		return this.blockName + (modName ? `_${modName.dasherize()}_${String(modValue).dasherize()}` : '');
	}

	/**
	 * Returns a full name of the specified element
	 *
	 * @param elName
	 * @param [modName]
	 * @param [modValue]
	 */
	getFullElName(elName: string, modName?: string, modValue?: any): string {
		const modStr = modName ? `_${modName.dasherize()}_${String(modValue).dasherize()}` : '';
		return `${this.blockName}__${elName.dasherize()}${modStr}`;
	}

	/**
	 * Returns CSS selector for the specified element
	 *
	 * @param elName
	 * @param [mods]
	 */
	getElSelector(elName: string, mods?: Object): string {
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
	elements(elName: string, mods?: Object): NodeList {
		if (!this.node) {
			throw new ReferenceError('Root node is not defined');
		}

		return this.node.querySelectorAll(this.getElSelector(elName, mods));
	}

	/**
	 * Returns a child element by the specified request
	 *
	 * @param elName
	 * @param [mods]
	 */
	element(elName: string, mods?: Object): Element | null {
		if (!this.node) {
			throw new ReferenceError('Root node is not defined');
		}

		return this.node.querySelector(this.getElSelector(elName, mods));
	}

	/**
	 * Sets a block modifier
	 *
	 * @param name
	 * @param value
	 */
	setMod(name: string, value: any): boolean {
		if (!this.node) {
			throw new ReferenceError('Root node is not defined');
		}

		value = String(value);

		const
			prev = this.mods[name];

		if (prev !== value) {
			this.removeMod(name);
			this.mods[name] = value;
			this.node.classList.add(this.getFullBlockName(name, value));

			const event = {
				event: 'block.mod.set',
				type: 'set',
				name,
				value,
				prev
			};

			this.localEvent.emit(`block.mod.set.${name}.${value}`, event);
			this.model.emit(`mod_set_${name}_${value}`, event);
			return true;
		}

		return false;
	}

	/**
	 * Removes a block modifier
	 *
	 * @param name
	 * @param [value]
	 */
	removeMod(name: string, value?: any): boolean {
		if (!this.node) {
			throw new ReferenceError('Root node is not defined');
		}

		const
			current = this.mods[name];

		if (current !== undefined && (value === undefined || current === String(value))) {
			this.mods[name] = undefined;
			this.node.classList.remove(this.getFullBlockName(name, current));

			const event = {
				event: 'block.mod.remove',
				type: 'remove',
				name,
				value: current
			};

			this.localEvent.emit(`block.mod.remove.${name}.${current}`, event);
			this.model.emit(`mod_remove_${name}_${current}`, event);
			return true;
		}

		return false;
	}

	/**
	 * Returns a value of the specified block modifier
	 * @param mod
	 */
	getMod(mod: string): string | undefined {
		return this.mods[mod];
	}

	/**
	 * Sets a modifier to the specified element
	 *
	 * @param link - link to the element
	 * @param elName
	 * @param modName
	 * @param value
	 */
	setElMod(link: Element, elName: string, modName: string, value: any): boolean {
		value = String(value);

		if (this.getElMod(link, elName, modName) !== value) {
			this.removeElMod(link, elName, modName);
			link.classList.add(this.getFullElName(elName, modName, value));

			this.localEvent.emit(`el.mod.set.${elName}.${modName}.${value}`, {
				element: elName,
				event: 'el.mod.set',
				type: 'set',
				link,
				modName,
				value
			});

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
	 */
	removeElMod(link: Element, elName: string, modName: string, value?: any): boolean {
		const
			current = this.getElMod(link, elName, modName);

		if (current !== undefined && (value === undefined || current === String(value))) {
			link.classList.remove(this.getFullElName(elName, modName, current));
			this.localEvent.emit(`el.mod.remove.${elName}.${modName}.${current}`, {
				element: elName,
				event: 'el.mod.remove',
				type: 'remove',
				link,
				modName,
				value: current
			});

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
			rgxp = new RegExp(`^${this.getFullElName(elName)}_${modName}_`),
			el = $C(link.classList).one.get((el) => rgxp.test(el));

		return el && el.split(/_+/)[MOD_VALUE];
	}
}
