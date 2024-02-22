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
	/**
	 * The property is set to `true` once the render function of a component has been called.
	 */
	protected hasRendered: boolean = false;

	constructor(component: iBlock) {
		super(component);

		const {meta} = component.unsafe;

		const
			renderKey = SSR ? 'ssrRender' : 'render',
			render = meta.component[renderKey];

		if (render != null) {
			meta.component[renderKey] = (...args: Parameters<typeof render>) => {
				const result = render(...args);
				this.hasRendered = true;

				return result;
			};
		}

		this.meta.hooks.beforeUpdate.push({
			fn: () => this.async.clearAll({
				group: 'asyncComponents'
			})
		});
	}
}

export default AsyncRender;
