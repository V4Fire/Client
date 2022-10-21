/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend, { fakeMethods } from 'components/friends/friend';
import type iBlock from 'components/super/i-block/i-block';

import type * as iter from 'components/friends/async-render/iterate';
import type * as render from 'components/friends/async-render/render';

interface AsyncRender {
	forceRender: typeof render.forceRender;
	deferForceRender: typeof render.deferForceRender;
	iterate: typeof iter.iterate;
}

@fakeMethods(
	'forceRender',
	'deferForceRender',
	'iterate'
)

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
