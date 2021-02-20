/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { RenderContext, VNode } from 'vue';
import { ComponentInterface } from 'core/component';
import * as _ from 'core/component/engines/zero/helpers';

/**
 * Clones the specified vnode
 * @param vnode
 */
export function cloneVNode(vnode: VNode): VNode {
	return (<any>vnode).cloneNode(true);
}

/**
 * Patches the specified VNode by using provided contexts
 *
 * @param vnode
 * @param ctx - component context
 * @param renderCtx - render context
 */
export function patchVNode(vnode: Element, ctx: ComponentInterface, renderCtx: RenderContext): void {
	const
		{data} = renderCtx,
		// @ts-ignore (access)
		{meta} = ctx;

	_.addClass(vnode, data);

	if (data.attrs && meta.params.inheritAttrs) {
		_.addAttrs(vnode, data.attrs);
	}

	_.addStaticDirectives(ctx, data, vnode[_.$$.directives], vnode);
}
