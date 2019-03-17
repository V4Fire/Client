/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Vue, { VNode, RenderContext } from 'vue';
import { ComponentInterface } from 'core/component/interface';

export { Vue as ComponentDriver };
export * from 'vue';

//#if VueInterfaces
export { InjectOptions } from 'vue/types/options';
export { VNode, ScopedSlot } from 'vue/types/vnode';
//#endif

export const supports = {
	functional: true,
	composite: true
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
 * Renders the specified data
 * @param data
 */
export function renderData(data: VNode): Node;
export function renderData(data: VNode[]): Node[];
export function renderData(data: CanArray<VNode>): CanArray<Node> {
	const
		isArr = Object.isArray(data);

	// @ts-ignore
	const vue = new Vue({
		render: (c) => isArr ? c('div', [data]) : data
	});

	const el = document.createElement('div');
	vue.$mount(el);

	return isArr ? Array.from(vue.$el.children) : vue.$el;
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
		// @ts-ignore
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

		// Reference to the element

		vData.ref = data.ref;
		vData.refInFor = data.refInFor;
	}
}
