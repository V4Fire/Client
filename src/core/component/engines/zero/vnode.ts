/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { RenderContext, VNode } from 'vue';
import type { ComponentInterface } from '@src/core/component';
import * as _ from '@src/core/component/engines/zero/helpers';

/**
 * Clones the specified vnode
 * @param vnode
 */
export function cloneVNode(vnode: VNode): VNode {
	return Object.cast(Object.cast<Node>(vnode).cloneNode(true));
}

/**
 * Patches the specified VNode by using provided contexts
 *
 * @param vnode
 * @param component - component instance
 * @param renderCtx - render context
 */
export function patchVNode(vnode: Element, component: ComponentInterface, renderCtx: RenderContext): void {
	const
		{data} = renderCtx,
		{meta} = component.unsafe;

	_.addToRefs(vnode, data, component.$parent?.unsafe.$refs);
	_.addClass(vnode, data);

	if (data.attrs && meta.params.inheritAttrs) {
		_.addAttrs(vnode, data.attrs);
	}

	_.addStaticDirectives(component, data, vnode[_.$$.directives], vnode);
}

/**
 * Renders the specified VNode/s and returns the result
 *
 * @param vnode
 * @param parent - parent component
 */
export function renderVNode(vnode: VNode, parent: ComponentInterface): Node;
export function renderVNode(vnodes: VNode[], parent: ComponentInterface): Node[];

// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
export function renderVNode(vnode: CanArray<VNode>, parent: ComponentInterface): CanArray<Node> {
	return Object.cast(vnode);
}
