/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend, { fakeMethods } from 'friends/friend';
import type iBlock from 'super/i-block/i-block';

import type * as traverse from 'friends/vdom/traverse';
import type * as vnode from 'friends/vdom/vnode';
import type * as render from 'friends/vdom/render';

interface VDOM {
	closest: typeof traverse.closest;
	findElem: typeof traverse.findElem;
	create: typeof vnode.create;
	render: typeof render.render;
	getRenderFactory: typeof render.getRenderFactory;
	getRenderFn: typeof render.getRenderFn;
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
	setInstance?: Function;

	constructor(component: iBlock) {
		super(component);

		this.meta.hooks.mounted.push({
			fn: () => {
				this.setInstance = this.ctx.$renderEngine.r.withAsyncContext.call(this.ctx, Promise.resolve.bind(Promise))[1];
			}
		});
	}
}

export default VDOM;
