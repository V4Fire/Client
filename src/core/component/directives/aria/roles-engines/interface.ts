/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Async from 'core/async';
import type iAccess from 'traits/i-access/i-access';
import type iBlock from 'super/i-block/i-block';

export abstract class AriaRoleEngine {
	/**
	 * Element on which the directive is set
	 */
	readonly el: HTMLElement;

	/**
	 * Component on which the directive is set
	 */
	readonly ctx: CanUndef<iAccess & iBlock>;

	/**
	 * Directive passed modifiers
	 */
	readonly modifiers: CanUndef<Dictionary<boolean>>;

	/**
	 * Async instance
	 */
	async: CanUndef<Async>;

	constructor({el, ctx, modifiers}: EngineOptions) {
		this.el = el;
		this.ctx = ctx;
		this.modifiers = modifiers;
	}

	abstract init(): void;
}

export interface EngineOptions {
	el: HTMLElement;
	modifiers: CanUndef<Dictionary<boolean>>;
	params: DictionaryType<any>;
	ctx: iBlock & iAccess;
}

export type EventBinder = (cb: Function) => void;

export const enum KeyCodes {
	ENTER = 'Enter',
	END = 'End',
	HOME = 'Home',
	LEFT = 'ArrowLeft',
	UP = 'ArrowUp',
	RIGHT = 'ArrowRight',
	DOWN = 'ArrowDown'
}

export enum EventNames {
	'@open' = 'onOpen',
	'@close' = 'onClose',
	'@change' = 'onChange'
}
