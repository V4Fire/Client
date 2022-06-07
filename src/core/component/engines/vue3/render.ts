/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import {

	resolveComponent as superResolveComponent,
	resolveDynamicComponent as superResolveDynamicComponent,

	createVNode as superCreateVNode,
	createElementVNode as superCreateElementVNode,

	createBlock as superCreateBlock,
	createElementBlock as superCreateElementBlock,

	renderList as superRenderList,
	withDirectives as superWithDirectives,

	VNode

} from 'vue';

import Vue from 'core/component/engines/vue3/lib';

import {

	interpolateStaticAttrs,
	wrapResolveComponent,

	wrapCreateVNode,
	wrapCreateElementVNode,

	wrapCreateBlock,
	wrapCreateElementBlock,

	wrapRenderList,
	wrapWithDirectives

} from 'core/component/render';

import type { ComponentInterface } from 'core/component/interface';

export {

	Fragment,
	Transition,
	TransitionGroup,

	toHandlers,
	toDisplayString,

	renderSlot,
	openBlock,

	createStaticVNode,
	createTextVNode,
	createCommentVNode,
	cloneVNode,

	normalizeClass,
	normalizeStyle,
	mergeProps,

	resolveDirective,
	resolveTransitionHooks,

	withCtx,

	// @ts-ignore (private)
	withAsyncContext,

	withKeys,
	withModifiers,

	vShow,
	vModelText,
	vModelSelect,
	vModelCheckbox,
	vModelRadio,
	vModelDynamic

} from 'vue';

export { interpolateStaticAttrs };

export const
	resolveComponent = wrapResolveComponent(superResolveComponent),
	resolveDynamicComponent = wrapResolveComponent(superResolveDynamicComponent);

export const
	createVNode = wrapCreateVNode(superCreateVNode),
	createElementVNode = wrapCreateElementVNode(superCreateElementVNode);

export const
	createBlock = wrapCreateBlock(superCreateBlock),
	createElementBlock = wrapCreateElementBlock(superCreateElementBlock);

export const
	renderList = wrapRenderList(superRenderList),
	withDirectives = wrapWithDirectives(superWithDirectives);

/**
 * Renders the specified VNode and returns the result
 *
 * @param vnode
 * @param [parent] - parent component
 */
export function render(vnode: VNode, parent?: ComponentInterface): Node;

/**
 * Renders the specified list of VNode-s and returns the result
 *
 * @param vnodes
 * @param [parent] - parent component
 */
export function render(vnodes: VNode[], parent?: ComponentInterface): Node[];
export function render(vnode: CanArray<VNode>, parent?: ComponentInterface): CanArray<Node> {
	const vue = new Vue({
		render: () => vnode,
		beforeCreate() {
			if (parent != null) {
				this.root = Object.create(parent.$root);

				Object.defineProperty(this.root, '$remoteParent', {
					configurable: true,
					enumerable: true,
					writable: true,
					value: parent
				});

				Object.defineProperty(this, 'unsafe', {
					configurable: true,
					enumerable: true,
					writable: true,
					value: this.root
				});
			}
		}
	});

	const
		el = document.createElement('div'),
		root = vue.mount(el);

	return Object.isArray(vnode) ? Array.from(el.childNodes) : root.$el;
}
