/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Vue, { RenderContext, VNode } from 'vue';

import { patchComponentVData } from 'core/component/vnode';
import type { ComponentInterface } from 'core/component/interface';

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
 * @param component - component instance
 * @param renderCtx - render context
 */
export function patchVNode(vnode: VNode, component: ComponentInterface, renderCtx: RenderContext): void {
	patchComponentVData(vnode.data, renderCtx.data, {
		patchAttrs: Boolean(component.unsafe.meta.params.inheritAttrs)
	});
}

/**
 * Renders the specified VNode/s and returns the result
 *
 * @param vnode
 * @param parent - parent component
 */
export function renderVNode(vnode: VNode, parent: ComponentInterface): Node;
export function renderVNode(vnodes: VNode[], parent: ComponentInterface): Node[];
export function renderVNode(vnode: CanArray<VNode>, parent: ComponentInterface): CanArray<Node> {
	const vue = new Vue({
		render: (c) => Object.isArray(vnode) ? c('div', vnode) : vnode
	});

	Object.set(vue, '$root', Object.create(parent.$root));
	Object.set(vue, '$root.$remoteParent', parent);
	Object.set(vue, '$root.unsafe', vue.$root);

	const el = document.createElement('div');
	vue.$mount(el);

	return Object.isArray(vnode) ? Array.from(vue.$el.children) : vue.$el;
}
