/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend, { fakeMethods } from 'components/friends/friend';

import type iBlock from 'components/super/i-block/i-block';
import type { TaskOptions } from 'components/friends/async-render/api';

//#if runtime has dummyComponents
import('components/friends/async-render/test/b-friends-async-render-dummy');
//#endif

interface AsyncRender {
	waitForceRender(elementToDrop?: string | ((ctx: Friend['component']) => CanPromise<CanUndef<string | Element>>)): void;
	forceRender(): void;
	deferForceRender(): void;
	iterate(value: unknown, sliceOrOpts?: number | [number?, number?] | TaskOptions, opts?: TaskOptions): unknown[];
}

@fakeMethods(
	'waitForceRender',
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
