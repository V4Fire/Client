/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { RenderContext, VNode } from 'vue';
import { patchComponentVData } from 'core/component/vnode';
import { ComponentInterface } from 'core/component/interface';

/**
 * Clones the specified vnode
 * @param vnode
 */
export function cloneVNode(vnode: VNode): VNode {
	return vnode;
}

/**
 * Patches the specified VNode by using provided contexts
 *
 * @param vnode
 * @param ctx - component context
 * @param renderCtx - render context
 */
export function patchVNode(vnode: VNode, ctx: ComponentInterface, renderCtx: RenderContext): void {
	patchComponentVData(vnode.data, renderCtx.data, {
		patchAttrs: Boolean(ctx.unsafe.meta.params.inheritAttrs)
	});
}
