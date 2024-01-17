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

	mergeProps as superMergeProps,
	renderList as superRenderList,
	renderSlot as superRenderSlot,

	withCtx as superWithCtx,
	withDirectives as superWithDirectives,
	resolveDirective as superResolveDirective,

	VNode,
	VNodeChild,
	VNodeArrayChildren

} from 'vue';

import Vue from 'core/component/engines/vue3/lib';

import {

	resolveAttrs,
	wrapResolveComponent,

	wrapCreateVNode,
	wrapCreateElementVNode,

	wrapCreateBlock,
	wrapCreateElementBlock,

	wrapRenderList,
	wrapRenderSlot,

	wrapWithDirectives,
	wrapResolveDirective,
	wrapMergeProps, wrapWithCtx

} from 'core/component/render';

import type { ComponentInterface } from 'core/component/interface';

export {

	Static,
	Comment,

	Suspense,
	Fragment,
	Teleport,

	Transition,
	TransitionGroup,

	getCurrentInstance,

	toHandlers,
	toHandlerKey,
	toDisplayString,

	openBlock,
	setBlockTracking,

	setDevtoolsHook,
	setTransitionHooks,
	useTransitionState,

	cloneVNode,
	createStaticVNode,
	createTextVNode,
	createCommentVNode,
	createSlots,

	normalizeClass,
	normalizeStyle,

	resolveTransitionHooks,

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

export { resolveAttrs };

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
	mergeProps = wrapMergeProps(superMergeProps),
	renderList = wrapRenderList(superRenderList),
	renderSlot = wrapRenderSlot(superRenderSlot);

export const
	withCtx = wrapWithCtx(superWithCtx),
	withDirectives = wrapWithDirectives(superWithDirectives),
	resolveDirective = wrapResolveDirective(superResolveDirective);

/**
 * Renders the specified VNode and returns the result
 *
 * @param vnode
 * @param [parent] - the parent component
 * @param [group] - the name of the async group within which rendering takes place
 */
export function render(
	vnode: VNode,
	parent?: ComponentInterface,
	group?: string
): Node;

/**
 * Renders the specified list of VNodes and returns the result
 *
 * @param vnodes
 * @param [parent] - the parent component
 * @param [group] - the name of the async group within which rendering takes place
 */
export function render(
	vnodes: VNode[],
	parent?: ComponentInterface,
	group?: string
): Node[];

export function render(vnode: CanArray<VNode>, parent?: ComponentInterface, group?: string): CanArray<Node> {
	const vue = new Vue({
		render: () => vnode,

		beforeCreate() {
			if (parent != null) {
				const root = Object.create(parent.$root, {
					$remoteParent: {
						configurable: true,
						enumerable: true,
						writable: true,
						value: parent
					}
				});

				Object.defineProperty(this, 'unsafe', {
					configurable: true,
					enumerable: true,
					writable: true,
					value: root
				});

				// Register a worker to clean up memory upon component destruction
				parent.unsafe.async.worker(() => {
					vue.unmount();
				}, {group});
			}
		}
	});

	const
		el = document.createElement('div'),
		root = vue.mount(el);

	if (Object.isArray(vnode)) {
		const children = Array.from(el.childNodes);

		if (vnode.length !== children.length) {
			if (isEmptyText(children[0])) {
				children.shift();
			}

			if (isEmptyText(children[children.length - 1])) {
				children.pop();
			}
		}

		return children;
	}

	return root.$el;

	function isEmptyText(node?: Node) {
		return node?.nodeType === 3 && node.textContent === '';
	}
}

/**
 * Deletes the specified node and frees up memory
 * @param node
 */
export function destroy(node: VNode | Node): void {
	if (node instanceof Node) {
		if (('__vnode' in node)) {
			removeVNode(node['__vnode']);
		}

		node.parentNode?.removeChild(node);

		if (node instanceof Element) {
			node.innerHTML = '';
		}

	} else {
		removeVNode(node);
	}

	function removeVNode(vnode: Nullable<VNode | VNodeArrayChildren | VNodeChild>) {
		if (vnode == null || Object.isPrimitive(vnode)) {
			return;
		}

		if (Object.isArray(vnode)) {
			vnode.forEach(removeVNode);
			return;
		}

		if (Object.isArray(vnode.children)) {
			vnode.children.forEach(removeVNode);
		}

		if (Object.isArray(vnode['dynamicChildren'])) {
			vnode['dynamicChildren'].forEach((vnode) => removeVNode(Object.cast(vnode)));
		}

		if (Object.isArray(vnode.dirs)) {
			vnode.dirs.forEach((binding) => {
				binding.dir.beforeUnmount?.(vnode.el, binding, vnode, null);
				binding.dir.unmounted?.(vnode.el, binding, vnode, null);
			});
		}

		if (vnode.component != null) {
			vnode.component.effect.stop();
			vnode.component = null;
		}

		vnode.props = {};

		['dirs', 'children', 'dynamicChildren', 'dynamicProps'].forEach((key) => {
			vnode[key] = [];
		});

		['el', 'ctx', 'ref', 'virtualComponent', 'virtualContext'].forEach((key) => {
			vnode[key] = null;
		});
	}
}
