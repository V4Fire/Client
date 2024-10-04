/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable @v4fire/require-jsdoc */

import { destroyedHooks } from 'core/component/const';
import type { ComponentInterface } from 'core/component/interface';

/**
 * A class for integrating lifecycle events of a functional component using the v-hook directive
 */
export class VHookLifeCycle {
	protected ctx: ComponentInterface['unsafe'];

	constructor(ctx: ComponentInterface) {
		this.ctx = Object.cast(ctx);
	}

	created(n: Element): void {
		this.ctx.$emit('[[COMPONENT_HOOK]]', 'created', n);
	}

	beforeMount(n: Element): void {
		this.ctx.$emit('[[COMPONENT_HOOK]]', 'beforeMount', n);
	}

	mounted(n: Element): void {
		this.ctx.$emit('[[COMPONENT_HOOK]]', 'mounted', n);
	}

	beforeUpdate(n: Element): void {
		this.ctx.$emit('[[COMPONENT_HOOK]]', 'beforeUpdate', n);
	}

	updated(n: Element): void {
		this.ctx.$emit('[[COMPONENT_HOOK]]', 'updated', n);
	}

	beforeUnmount(n: Element): void {
		// A component might have already been removed by explicitly calling $destroy
		if (destroyedHooks[this.ctx.hook] != null) {
			return;
		}

		this.ctx.$emit('[[COMPONENT_HOOK]]', 'beforeDestroy', n);
	}

	unmounted(n: Element): void {
		// A component might have already been removed by explicitly calling $destroy
		if (destroyedHooks[this.ctx.hook] != null) {
			return;
		}

		this.ctx.$emit('[[COMPONENT_HOOK]]', 'destroyed', n);
	}
}
