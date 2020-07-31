/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { RenderContext, VNode } from 'vue';
import { ComponentInterface } from 'core/component/interface';

/**
 * Clones the specified vnode
 * @param vnode
 */
export function cloneVNode(vnode: VNode): VNode {
	return vnode;
}

/**
 * Patches the specified virtual node: add classes, event handlers, etc.
 *
 * @param vnode
 * @param ctx - component fake context
 * @param renderCtx - render context
 */
export function patchVNode(vnode: VNode, ctx: ComponentInterface, renderCtx: RenderContext): void {
	vnode.data = vnode.data ?? {};
	const vData = vnode.data;

	const
		{data} = renderCtx,
		{meta} = ctx.unsafe;

	if (Object.isTruly(data)) {
		vData.staticClass = vData.staticClass ?? '';

		// Custom classes and attributes

		if (Object.isTruly(data.staticClass)) {
			vData.staticClass += ` ${data.staticClass}`;
		}

		if (Object.isTruly(data.class)) {
			vData.class = [].concat(vData.class, data.class);
		}

		if (Object.isTruly(data.style)) {
			vData.style = Array.concat([], vData.style, data.style);
		}

		if (data.attrs && meta.params.inheritAttrs) {
			vData.attrs = Object.assign(vData.attrs ?? {}, data.attrs);
		}

		vData.directives = data.directives;
		vData.on = vData.on ?? {};

		if (data.nativeOn) {
			const
				{on} = vData;

			for (let o = data.nativeOn, keys = Object.keys(o), i = 0; i < keys.length; i++) {
				const key = keys[i];
				on[key] = Array.concat([], on[key], o[key]);
			}
		}

		// Reference to the element

		vData.ref = data.ref;
		vData.refInFor = data.refInFor;
	}
}
