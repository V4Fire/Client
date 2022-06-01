/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend from 'friends/friend';
import type iBlock from 'super/i-block/i-block';

import type * as iter from 'friends/async-render/iter';
import type * as render from 'friends/async-render/render';

interface AsyncRender {
	forceRender: typeof render.forceRender;
	deferForceRender: typeof render.deferForceRender;
	iterate: typeof iter.iterate;
}

class AsyncRender extends Friend {
	constructor(component: iBlock) {
		super(component);

		this.meta.hooks.beforeUpdate.push({
			fn: () => this.async.clearAll({
				group: 'asyncComponents'
			})
		});
	}
}

export default AsyncRender;
