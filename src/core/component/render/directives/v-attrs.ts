/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { VNode, VNodeTypes, VNodeProps } from 'core/component/engines';

import { directives } from 'core/component/render/directives/const';
import type { CreateVNode } from 'core/component/render/directives/interface';

export default vAttrs;
directives.push(vAttrs);

function vAttrs(createVNode: CreateVNode, type: VNodeTypes, props: Dictionary & VNodeProps): CanUndef<VNode> {
	console.log(props);

	if (props['v-attrs'] == null) {
		return undefined;
	}

	return Object.cast(props.from);
}
