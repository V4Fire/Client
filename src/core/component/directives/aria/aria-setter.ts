/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import * as ariaRoles from 'core/component/directives/aria/roles-engines';
import Async from 'core/async';
import AriaRoleEngine, { eventNames } from 'core/component/directives/aria/interface';
import type iBlock from 'super/i-block/i-block';
import type { DirectiveOptions } from 'core/component/directives/aria/interface';

/**
 * Class-helper for making base operations for the directive
 */
export default class AriaSetter extends AriaRoleEngine {
	/**
	 * Async instance for aria directive
	 */
	override readonly async: Async;

	/**
	 * Role engine instance
	 */
	role: CanUndef<AriaRoleEngine>;

	constructor(options: DirectiveOptions) {
		super(options);

		this.async = new Async();
		this.setAriaRole();

		if (this.role != null) {
			this.role.async = this.async;
		}

		this.init();
	}

	/**
	 * Initiates the base logic of the directive
	 */
	init(): void {
		this.setAriaLabel();
		this.addEventHandlers();

		this.role?.init();
	}

	/**
	 * Runs on update directive hook. Removes listeners from component if the component is Functional
	 */
	update(): void {
		const
			ctx = <iBlock>this.options.vnode.fakeContext;

		if (ctx.isFunctional) {
			ctx.off();
		}
	}

	/**
	 * Runs on unbind directive hook. Clears the Async instance
	 */
	destroy(): void {
		this.async.clearAll();
	}

	/**
	 * If the role was passed as a directive argument sets specified engine
	 */
	protected setAriaRole(): CanUndef<AriaRoleEngine> {
		const
			{arg: role} = this.options.binding;

		if (role == null) {
			return;
		}

		this.role = new ariaRoles[role](this.options);
	}

	/**
	 * Sets aria-label, aria-labelledby, aria-description and aria-describedby attributes to the element
	 * from passed parameters
	 */
	protected setAriaLabel(): void {
		const
			{vnode, binding, el} = this.options,
			{dom} = Object.cast<iBlock['unsafe']>(vnode.fakeContext),
			params = Object.isCustomObject(binding.value) ? binding.value : {};

		for (const mod in binding.modifiers) {
			if (!mod.startsWith('#')) {
				continue;
			}

			const
				title = mod.slice(1),
				id = dom.getId(title);

			el.setAttribute('aria-labelledby', id);
		}

		if (params.label != null) {
			el.setAttribute('aria-label', params.label);

		} else if (params.labelledby != null) {
			el.setAttribute('aria-labelledby', params.labelledby);
		}

		if (params.description != null) {
			el.setAttribute('aria-description', params.description);

		} else if (params.describedby != null) {
			el.setAttribute('aria-describedby', params.describedby);
		}
	}

	/**
	 * Sets handlers for the base role events: open, close, change.
	 * Expects the passed into directive specified event properties to be Function, Promise or String
	 */
	protected addEventHandlers(): void {
		if (this.role == null) {
			return;
		}

		const
			params = this.options.binding.value;

		for (const key in params) {
			if (key in eventNames) {
				const
					callback = this.role[eventNames[key]].bind(this.role),
					property = params[key];

				if (Object.isFunction(property)) {
					property(callback);

				} else if (Object.isPromiseLike(property)) {
					void property.then(callback);

				} else if (Object.isString(property)) {
					const
						ctx = <iBlock>this.options.vnode.fakeContext;

					ctx.on(property, callback);
				}
			}
		}
	}
}
