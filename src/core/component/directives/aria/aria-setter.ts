/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import * as ariaRoles from 'core/component/directives/aria/roles-engines';
import Async from 'core/async';
import AriaRoleEngine, { eventsNames } from 'core/component/directives/aria/interface';
import type iBlock from 'super/i-block/i-block';
import type { DirectiveOptions } from 'core/component/directives/aria/interface';

export default class AriaSetter extends AriaRoleEngine {
	override $a: Async;
	role: CanUndef<AriaRoleEngine>;

	constructor(options: DirectiveOptions) {
		super(options);

		this.$a = new Async();
		this.setAriaRole();

		if (this.role != null) {
			this.role.$a = this.$a;
		}
	}

	init(): void {
		this.setAriaLabel();
		this.addEventHandlers();

		this.role?.init();
	}

	override update(): void {
		const
			ctx = <iBlock>this.options.vnode.fakeContext;

		if (ctx.isFunctional) {
			ctx.off();
		}

		if (this.role != null) {
			this.role.options = this.options;
			this.role.update?.();
		}
	}

	override clear(): void {
		this.$a.clearAll();

		this.role?.clear?.();
	}

	addEventHandlers(): void {
		if (this.role == null) {
			return;
		}

		const
			$v = this.options.binding.value;

		for (const key in $v) {
			if (key in eventsNames) {
				const
					callback = this.role[eventsNames[key]],
					property = $v[key];

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

	setAriaRole(): CanUndef<AriaRoleEngine> {
		const
			{arg: role} = this.options.binding;

		if (role == null) {
			return;
		}

		this.role = new ariaRoles[role](this.options);
	}

	setAriaLabel(): void {
		const
			{vnode, binding, el} = this.options,
			{dom} = Object.cast<iBlock['unsafe']>(vnode.fakeContext),
			value = Object.isCustomObject(binding.value) ? binding.value : {};

		for (const mod in binding.modifiers) {
			if (!mod.startsWith('#')) {
				continue;
			}

			const
				title = mod.slice(1),
				id = dom.getId(title);

			el.setAttribute('aria-labelledby', id);
		}

		if (value.label != null) {
			el.setAttribute('aria-label', value.label);

		} else if (value.labelledby != null) {
			el.setAttribute('aria-labelledby', dom.getId(value.labelledby));
		}

		if (value.description != null) {
			el.setAttribute('aria-description', value.description);

		} else if (value.describedby != null) {
			el.setAttribute('aria-describedby', dom.getId(value.describedby));
		}
	}
}
