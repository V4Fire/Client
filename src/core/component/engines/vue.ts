/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Vue, { VNode, RenderContext } from 'vue';

export { Vue as ComponentDriver };
export * from 'vue';

//#if VueInterfaces
export { InjectOptions } from 'vue/types/options';
export { VNode, ScopedSlot } from 'vue/types/vnode';
//#endif

export const supports = {
	functional: true
};

export const
	minimalCtx = {};

{
	const
		obj = Vue.prototype;

	for (const key in obj) {
		if (key.length === 2) {
			minimalCtx[key] = obj[key];
		}
	}
}

/**
 * Patches the specified virtual node: add classes, event handlers, etc.
 *
 * @param vNode
 * @param ctx - component fake context
 * @param renderCtx - render context
 */
export function patchVNode(vNode: VNode, ctx: Dictionary<any>, renderCtx: RenderContext): void {
	const
		{data: vData} = vNode,
		{data} = renderCtx,
		{meta} = ctx;

	if (vData) {
		vData.staticClass = vData.staticClass || '';

		// Custom classes and attributes

		if (data.staticClass) {
			vData.staticClass += ` ${data.staticClass}`;
		}

		if (data.class) {
			vData.class = [].concat(vData.class, data.class);
		}

		if (data.attrs && meta.params.inheritAttrs) {
			// tslint:disable-next-line:prefer-object-spread
			vData.attrs = Object.assign(vData.attrs || {}, data.attrs);
		}

		// Reference to the element

		if (data.ref) {
			vData.ref = data.ref;
		}

		// Directives

		if (data.directives) {
			for (let o = data.directives, i = 0; i < o.length; i++) {
				const
					el = o[i];

				if (el.name === 'show' && !el.value) {
					vData.attrs = vData.attrs || {};
					vData.attrs.style = (vData.attrs.style || '') + ';display: none;';
				}
			}
		}
	}
}
