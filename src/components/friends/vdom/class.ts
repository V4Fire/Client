/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend, { fakeMethods } from 'components/friends/friend';
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
	 * Executes the given function in the component render context.
	 * This function is necessary to render components asynchronously.
	 */
	withRenderContext<T>(cb: (...args: any) => T): T {
		return cb();
	}

	/**
	 * Saves the component active rendering context
	 */
	saveRenderContext(): void {
		this.withRenderContext = Object.cast(this.ctx.$renderEngine.r.withCtx((cb) => cb()));
	}
}

export default VDOM;
