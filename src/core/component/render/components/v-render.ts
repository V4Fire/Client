/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { VNode, VNodeTypes, VNodeProps } from 'core/component/engines';

import { components } from 'core/component/render/components/const';
import type { CreateVNode } from 'core/component/render/components/interface';

export default vRender;
components['v-render'] = vRender;

function vRender(createVNode: CreateVNode, type: VNodeTypes, props: Dictionary & VNodeProps): CanUndef<VNode> {
	if (type !== 'v-render' || props.from == null) {
		return undefined;
	}

	return Object.cast(props.from);
}
