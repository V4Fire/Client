/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Async from 'core/async';
import type { ComponentInterface } from 'core/component';

export abstract class ARIARole {
	/**
	 * Type: parameters passed from the associated directive
	 */
	readonly Params!: AbstractParams;

	/**
	 * Type: a component context within which the associated directive is used
	 */
	readonly Ctx!: ComponentInterface;

	/**
	 * An element to which the associated directive is applied
	 */
	readonly el: AccessibleElement;

	/**
	 * A component context within which the associated directive is used
	 */
	readonly ctx?: this['Ctx'];

	/**
	 * Parameters passed from the associated directive
	 */
	readonly params: this['Params'];

	/**
	 * Modifiers passed from the associated directive
	 */
	readonly modifiers?: Dictionary<boolean>;

	/** @see [[Async]] */
	protected async: Async;

	constructor({el, ctx, modifiers, params = {}, async}: RoleOptions<ARIARole['Params']>) {
		this.el = el;
		this.ctx = ctx;
		this.modifiers = modifiers;
		this.params = params;
		this.async = async;
	}

	/**
	 * Initializes the role
	 */
	abstract init(): void;

	/**
	 * Sets a new value of the specified attribute to the passed element
	 *
	 * @param name - the attribute name
	 * @param value - the attribute value or a list of values
	 * @param [el] - the element to set an attribute
	 */
	protected setAttribute(name: string, value: CanUndef<CanArray<unknown>>, el: Element = this.el): void {
		if (value == null) {
			return;
		}

		el.setAttribute(name, Object.isArray(value) ? value.join(' ') : String(value));
		this.async.worker(() => el.removeAttribute(name));
	}
}

interface AbstractParams {}

export interface RoleOptions<P extends AbstractParams, C extends ComponentInterface = ComponentInterface> {
	el: AccessibleElement;
	ctx?: C;
	params?: P;
	modifiers?: Dictionary<boolean>;
	async: Async;
}

export type HandlerAttachment = ((cb: Function) => void) | Promise<any> | string;

export const enum KeyCodes {
	ENTER = 'Enter',
	END = 'End',
	HOME = 'Home',
	LEFT = 'ArrowLeft',
	UP = 'ArrowUp',
	RIGHT = 'ArrowRight',
	DOWN = 'ArrowDown'
}
