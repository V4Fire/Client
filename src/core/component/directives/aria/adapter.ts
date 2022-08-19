/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import type iBlock from 'super/i-block/i-block';

import * as roles from 'core/component/directives/aria/roles-engines';
import type { DirectiveOptions } from 'core/component/directives/aria/interface';
import type { AriaRoleEngine, EngineOptions } from 'core/component/directives/aria/roles-engines';

/**
 * An adapter to create an ARIA role instance based on the passed directive options and to add common attributes
 */
export default class AriaAdapter {
	/**
	 * Parameters passed from the directive
	 */
	protected readonly options: DirectiveOptions;

	/** @see [[Async]] */
	protected readonly async: Async = new Async();

	/**
	 * An instance of the associated ARIA role
	 */
	protected role: CanUndef<AriaRoleEngine>;

	constructor(options: DirectiveOptions) {
		this.options = options;
		this.setAriaRole();
		this.init();
	}

	/**
	 * Initiates the base logic of the directive
	 */
	init(): void {
		this.setAriaLabelledBy();
		this.setAriaAttributes();
		this.addEventHandlers();

		this.role?.init();
	}

	/**
	 * Runs on unbind directive hook. Clears the Async instance.
	 */
	destroy(): void {
		this.async.clearAll();
	}

	protected get ctx(): iBlock['unsafe'] {
		return Object.cast<iBlock['unsafe']>(this.options.vnode.fakeContext);
	}

	/**
	 * If the role was passed as a directive argument sets specified engine
	 */
	protected setAriaRole(): CanUndef<AriaRoleEngine> {
		const
			{el, binding} = this.options,
			{value, modifiers, arg: role} = binding;

		if (role == null) {
			return;
		}

		const
			engine = `${role.capitalize()}Engine`;

		const options: EngineOptions<AriaRoleEngine['Params']> = {
			el,
			modifiers,
			params: value,
			ctx: this.ctx,
			async: this.async
		};

		this.role = new roles[engine](options);
	}

	/**
	 * Sets aria-labelledby attribute to the element from directive parameters
	 */
	protected setAriaLabelledBy(): void {
		const
			{binding, el} = this.options,
			{dom} = this.ctx,
			{labelledby} = binding.value ?? {},
			attr = 'aria-labelledby';

		let
			isAttrSet = false;

		for (const mod in binding.modifiers) {
			if (!mod.startsWith('#')) {
				continue;
			}

			const
				title = mod.slice(1),
				id = dom.getId(title);

			el.setAttribute(attr, id);
			isAttrSet = true;
		}

		if (labelledby != null) {
			el.setAttribute(attr, Object.isArray(labelledby) ? labelledby.join(' ') : labelledby);
			isAttrSet = true;
		}

		if (isAttrSet) {
			this.async.worker(() => el.removeAttribute(attr));
		}
	}

	/**
	 * Sets aria attributes from passed params except `aria-labelledby`
	 */
	protected setAriaAttributes(): void {
		const
			{el, binding} = this.options,
			params: Dictionary<string> = binding.value;

		for (const key in params) {
			if (!params.hasOwnProperty(key)) {
				continue;
			}

			const
				roleParams = this.role?.Params,
				param = params[key];

			if (!roleParams?.hasOwnProperty(key) && key !== 'labelledby' && param != null) {
				const
					attr = `aria-${key}`;

				el.setAttribute(attr, param);
				this.async.worker(() => el.removeAttribute(attr));
			}
		}
	}

	/**
	 * Sets handlers for the base role events: open, close, change.
	 * Expects the passed into directive specified event properties to be Function, Promise or String.
	 */
	protected addEventHandlers(): void {
		if (this.role == null) {
			return;
		}

		const
			params = this.options.binding.value;

		for (const key in params) {
			if (key.startsWith('@')) {
				const
					callbackName = `on-${key.slice(1)}`.camelize(false);

				if (!Object.isFunction(this.role[callbackName])) {
					Object.throw('Aria role engine does not contains event handler for passed event name or the type of engine\'s property is not a function');
				}

				const
					callback = this.role[callbackName].bind(this.role),
					property = params[key];

				if (Object.isFunction(property)) {
					property(callback);

				} else if (Object.isPromiseLike(property)) {
					void property.then(callback);

				} else if (Object.isString(property)) {
					this.ctx.on(property, callback);
				}
			}
		}
	}
}
