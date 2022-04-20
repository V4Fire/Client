/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { VNode } from 'core/component/engines';

import { directives } from 'core/component/render/directives/const';
import type { CreateVNode } from 'core/component/render/directives/interface';

/**
 * Creates a new element VNode by the specified parameters with applying internal directives, like `v-attrs`.
 * The function takes an original function to create VNodes and list of arguments and returns a new VNode.
 *
 * @param createVNode - original function to create a VNode
 * @param args - operation arguments
 */
export function createVNodeWithDirectives(createVNode: CreateVNode, ...args: any[]): VNode {
	for (let i = 0; i < directives.length; i++) {
		const
			res = directives[i](createVNode, ...args);

		if (res != null) {
			return res;
		}
	}

	return createVNode(...args);
}
