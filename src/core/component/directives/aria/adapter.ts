/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import type iBlock from 'super/i-block/i-block';

import * as roles from 'core/component/directives/aria/roles';
import type { DirectiveOptions } from 'core/component/directives/aria/interface';
import type { ARIARole, EngineOptions } from 'core/component/directives/aria/roles';

/**
 * An adapter to create an ARIA role instance based on the passed directive params and to add common attributes
 */
export default class ARIAAdapter {
	/**
	 * Parameters passed from the associated directive
	 */
	protected readonly params: DirectiveOptions;

	/** @see [[Async]] */
	protected readonly async: Async = new Async();

	/**
	 * An instance of the associated ARIA role
	 */
	protected role: ARIARole | null = null;

	/**
	 * A context of the associated directive
	 */
	protected get ctx(): iBlock['unsafe'] {
		return Object.cast<iBlock['unsafe']>(this.params.vnode.fakeContext);
	}

	/**
	 * @param params - parameters passed from the associated directive
	 */
	constructor(params: DirectiveOptions) {
		this.params = params;
		this.createRole();
		this.init();
	}

	/**
	 * Initializes the adapter according to the associated directive parameters
	 */
	init(): void {
		this.setAttributes();
		this.attachRoleHandlers();
		this.role?.init();
	}

	/**
	 * Destroys the adapter and cancels all tied threads
	 */
	destroy(): void {
		this.async.clearAll().locked = true;
	}

	/**
	 * Creates an ARIA role based on the associated directive parameters.
	 * If the role is not explicitly specified in the parameters, then the common strategy will be used.
	 * The method returns an instance of the created role or null.
	 */
	protected createRole(): ARIARole | null {
		const
			{el, binding} = this.params,
			{value, modifiers, arg: role} = binding;

		if (role == null) {
			return null;
		}

		const params: EngineOptions<ARIARole['Params']> = {
			el,
			modifiers,
			params: value,
			ctx: this.ctx,
			async: this.async
		};

		return this.role = new roles[role.capitalize()](params);
	}

	/**
	 * Sets the ARIA attributes passed in the associated directive parameters
	 */
	protected setAttributes(): void {
		const
			{binding} = this.params;

		for (const mod in binding.modifiers) {
			if (!mod.startsWith('#')) {
				continue;
			}

			this.setAttribute('aria-labelledby', this.ctx.dom.getId(mod.slice(1)));
			break;
		}

		if (Object.isDictionary(binding.value)) {
			Object.forEach(binding.value, (param, key) => {
				const
					roleParams = this.role?.Params;

				if (param == null || roleParams?.hasOwnProperty(key)) {
					return;
				}

				this.setAttribute(`aria-${key}`.dasherize(), param);
			});
		}
	}

	/**
	 * Sets the value of the specified attribute to the node on which the ARIA directive is initialized
	 *
	 * @param name - the attribute name
	 * @param value - the attribute value or a list of values
	 */
	protected setAttribute(name: string, value: CanUndef<CanArray<unknown>>): void {
		const
			{el} = this.params;

		if (value == null) {
			return;
		}

		el.setAttribute(name, Object.isArray(value) ? value.join(' ') : String(value));
		this.async.worker(() => el.removeAttribute(name));
	}

	/**
	 * Attaches the handlers specified in the parameters of the associated directive to the created ARIA role.
	 * Any handler can be specified as a function, a promise, or a string.
	 *
	 * To specify a handler, use the `@` character at the beginning of the parameter key.
	 * For example, `@open` will be converted to the role `onOpen` handler.
	 */
	protected attachRoleHandlers(): void {
		const
			{role, params: {binding}} = this;

		if (role == null || !Object.isDictionary(binding.value)) {
			return;
		}

		Object.forEach(binding.value, (val, key) => {
			if (val == null || !key.startsWith('@')) {
				return;
			}

			const
				handlerName = `on-${key.slice(1)}`.camelize(false);

			if (!Object.isFunction(role[handlerName])) {
				throw new ReferenceError(`The associated ARIA role does not have a handler named "${handlerName}"`);
			}

			const
				handler = role[handlerName].bind(this.role);

			if (Object.isFunction(val)) {
				val(handler);

			} else if (Object.isPromiseLike(val)) {
				val.then(handler, stderr);

			} else if (Object.isString(val)) {
				this.async.on(this.ctx, val, handler);
			}
		});
	}
}
