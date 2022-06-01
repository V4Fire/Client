/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend from 'friends/friend';

import type iBlock from 'super/i-block/i-block';

export default class AsyncRender extends Friend {
	constructor(component: iBlock) {
		super(component);

		this.meta.hooks.beforeUpdate.push({
			fn: () => this.async.clearAll({
				group: 'asyncComponents'
			})
		});
	}
}
