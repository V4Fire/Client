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
	const
		vData = vnode.data = vnode.data || {};

	const
		{data} = renderCtx,
		// @ts-ignore (access)
		{meta} = ctx;

	if (data) {
		vData.staticClass = vData.staticClass || '';

		// Custom classes and attributes

		if (data.staticClass) {
			vData.staticClass += ` ${data.staticClass}`;
		}

		if (data.class) {
			vData.class = [].concat(vData.class, data.class);
		}

		if (data.style) {
			vData.style = (<unknown[]>[]).concat(vData.style || [], data.style);
		}

		if (data.attrs && meta.params.inheritAttrs) {
			// tslint:disable-next-line:prefer-object-spread
			vData.attrs = Object.assign(vData.attrs || {}, data.attrs);
		}

		vData.directives = data.directives;

		const
			on = vData.on = vData.on || {};

		if (data.nativeOn) {
			for (let o = data.nativeOn, keys = Object.keys(o), i = 0; i < keys.length; i++) {
				const key = keys[i];
				on[key] = (<Function[]>[]).concat(on[key] || [], o[key] || []);
			}
		}

		// Reference to the element

		vData.ref = data.ref;
		vData.refInFor = data.refInFor;
	}
}
