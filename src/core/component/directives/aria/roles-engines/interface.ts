/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Async from 'core/async';
import type { ComponentInterface } from 'super/i-block/i-block';

export abstract class AriaRoleEngine {
	/**
	 * Type: directive passed params
	 */
	readonly Params!: AbstractParams;

	/**
	 * Type: component on which the directive is set
	 */
	readonly Ctx!: ComponentInterface;

	/**
	 * Element on which the directive is set
	 */
	readonly el: HTMLElement;

	/**
	 * Component on which the directive is set
	 */
	readonly ctx?: this['Ctx'];

	/**
	 * Directive passed modifiers
	 */
	readonly modifiers?: Dictionary<boolean>;

	/**
	 * Directive passed params
	 */
	readonly params: this['Params'];

	/**
	 * Async instance
	 */
	async: CanUndef<Async>;

	/**
	 * Directive expected params list
	 */
	static params: string[];

	constructor({el, ctx, modifiers, params, async}: EngineOptions<AriaRoleEngine['Params']>) {
		this.el = el;
		this.ctx = ctx;
		this.modifiers = modifiers;
		this.params = params;
		this.async = async;
	}

	abstract init(): void;
}

export interface AbstractParams {}

export interface EngineOptions<P extends AbstractParams, C extends ComponentInterface = ComponentInterface> {
	el: HTMLElement;
	ctx?: C;
	modifiers?: Dictionary<boolean>;
	params: P;
	async: Async;
}

export type HandlerAttachment = (cb: Function) => void;

export const enum KeyCodes {
	ENTER = 'Enter',
	END = 'End',
	HOME = 'Home',
	LEFT = 'ArrowLeft',
	UP = 'ArrowUp',
	RIGHT = 'ArrowRight',
	DOWN = 'ArrowDown'
}
