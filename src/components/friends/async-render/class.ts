/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend, { fakeMethods } from 'components/friends/friend';

import type iBlock from 'components/super/i-block/i-block';
import type * as api from 'components/friends/async-render/api';

interface AsyncRender {
	forceRender: typeof api.forceRender;
	deferForceRender: typeof api.deferForceRender;
	iterate: typeof api.iterate;
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
