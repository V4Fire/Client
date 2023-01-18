/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend, { fakeMethods } from 'components/friends/friend';

import type iBlock from 'components/super/i-block/i-block';
import type * as api from 'components/friends/vdom/api';

interface VDOM {
	closest: typeof api.closest;
	findElement: typeof api.findElement;

	create: typeof api.create;
	render: typeof api.render;

	getRenderFactory: typeof api.getRenderFactory;
	getRenderFn: typeof api.getRenderFn;
}

@fakeMethods(
	'closest',
	'findElem',

	'create',
	'render',

	'getRenderFactory',
	'getRenderFn'
)

class VDOM extends Friend {
	/**
	 * Sets the current component instance as active.
	 * This function is necessary to render components asynchronously.
	 */
	protected setInstance?: Function;

	constructor(component: iBlock) {
		super(component);

		if (this.ctx.isFunctional) {
			Object.defineProperty(this, 'setInstance', {
				configurable: true,
				enumerable: true,
				get() {
					return this.ctx.$normalParent?.unsafe.vdom.setInstance;
				}
			});

		} else {
			this.meta.hooks.mounted.push({
				fn: () => {
					this.setInstance = this.ctx.$renderEngine.r.withAsyncContext.call(this.ctx, Promise.resolve.bind(Promise))[1];
				}
			});
		}
	}

	/**
	 * Executes the given function in the component render context.
	 * This function is necessary to render components asynchronously.
	 */
	withRenderContext<T>(cb: (...args: any) => T): T {
		this.setInstance?.();
		return cb();
	}

	/**
	 * Saves the component active rendering context
	 */
	saveRenderContext(): void {
		const
			{ctx} = this;

		const
			withCtx = ctx.$renderEngine.r.withCtx((cb) => cb());

		ctx.$withCtx = (cb) => {
			if (ctx.hook === 'mounted' || ctx.hook === 'updated') {
				return withCtx(cb);
			}

			return cb();
		};
	}
}

export default VDOM;
