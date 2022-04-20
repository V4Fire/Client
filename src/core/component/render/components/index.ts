/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import 'core/component/render/components/v-render';

import type { VNode } from 'core/component/engines';

import { components } from 'core/component/render/components/const';
import type { CreateVNode } from 'core/component/render/components/interface';

/**
 * Creates a new VNode by the specified parameters with applying internal component directives, like `v-render`.
 * The function takes an original function to create VNodes and list of arguments and returns a new VNode.
 *
 * @param createVNode - original function to create a VNode
 * @param type - VNode type
 * @param args - operation arguments
 */
export function createVNodeWithDirectives(createVNode: CreateVNode, type: string, ...args: any[]): VNode {
	return components[type]?.(createVNode, type, ...args) ?? createVNode(...args);
}
