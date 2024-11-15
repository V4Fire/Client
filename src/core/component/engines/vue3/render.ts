/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { disposeLazy } from 'core/lazy';

import * as gc from 'core/component/gc';

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

	withModifiers as superWithModifiers,

	VNodeChild,
	VNodeArrayChildren,

	Comment

} from 'vue';

import type { VNode } from 'core/component/engines/interface';

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
	wrapMergeProps,

	wrapWithCtx,
	wrapWithModifiers

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
	withMemo,

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
	renderSlot = wrapRenderSlot(superRenderSlot);

export const
	withCtx = wrapWithCtx(superWithCtx),
	withDirectives = wrapWithDirectives(superWithDirectives),
	resolveDirective = wrapResolveDirective(superResolveDirective);

export const withModifiers = wrapWithModifiers(superWithModifiers);

export const renderList = wrapRenderList(superRenderList);

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
	// If there is nothing to render, there is no need to create a virtual Vue instance
	if (Object.isArray(vnode)) {
		// If only a comment needs to be rendered, consider such renderings as empty
		if (vnode.length === 0 || vnode.every(isEmptyVNode)) {
			return [];
		}

	// If only a comment needs to be rendered, consider such renderings as empty
	} else if (isEmptyVNode(vnode)) {
		return document.createDocumentFragment();
	}

	const vue = new Vue({
		render: () => vnode,

		beforeCreate() {
			if (parent != null) {
				// To safely extend the $root object with the properties we need,
				// we create a new object with a prototype
				const root = Object.create(parent.r, {
					// This property is necessary because the actual $parent
					// of this component refers to an App that is created higher up.
					$remoteParent: {
						configurable: true,
						enumerable: true,
						writable: true,
						value: parent
					}
				});

				// @ts-ignore (unsafe)
				root['remoteRootInstances'] = root.remoteRootInstances + 1;

				Object.defineProperty(this, 'unsafe', {
					configurable: true,
					enumerable: true,
					writable: true,
					value: root
				});

				// Register a worker to clean up memory upon component destruction
				registerDestructor();
			}

			function registerDestructor() {
				parent?.unsafe.async.worker(() => {
					if ('skipDestruction' in vnode) {
						delete vnode.skipDestruction;
						registerDestructor();

					} else {
						// To immediately initiate the removal of all asynchronously added components, we explicitly call unmount,
						// but we do this through setImmediate to allow the destroyed hook to execute,
						// as it relies on the component having an event API
						setImmediate(() => {
							vue.unmount();
						});

						gc.add(function* destructor() {
							const vnodes = Array.toArray(vnode);

							for (let i = 0; i < vnodes.length; i++) {
								destroy(vnodes[i]);
								yield;
							}

							disposeLazy(vue);
						}());
					}
				}, {group});
			}
		},

		beforeUnmount() {
			const root = this.unsafe.r;

			// @ts-ignore (unsafe)
			root['remoteRootInstances'] = root.remoteRootInstances - 1;
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

	function isEmptyVNode(vnode: Nullable<VNode>) {
		return vnode == null || vnode.type === Comment && vnode.children === 'v-if';
	}
}

/**
 * Deletes the specified node and frees up memory
 * @param node
 */
export function destroy(node: VNode | Node): void {
	const destroyedVNodes = new WeakSet<VNode>();

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
			for (let i = 0; i < vnode.length; i++) {
				removeVNode(vnode[i]);
			}

			return;
		}

		if (destroyedVNodes.has(vnode)) {
			return;
		}

		destroyedVNodes.add(vnode);

		if (Object.isArray(vnode.children)) {
			for (let i = 0; i < vnode.children.length; i++) {
				removeVNode(vnode.children[i]);
			}
		}

		if ('dynamicChildren' in vnode && Object.isArray(vnode.dynamicChildren)) {
			for (let i = 0; i < vnode.dynamicChildren.length; i++) {
				removeVNode(vnode.dynamicChildren[i]);
			}
		}

		gc.add(function* destructor() {
			if (vnode.component != null) {
				vnode.component.effect.stop();
				vnode.component = null;
			}

			vnode.props = {};

			yield;

			for (const key of ['dirs', 'children', 'dynamicChildren', 'dynamicProps']) {
				vnode[key] = [];
			}

			for (const key of ['el', 'ctx', 'ref', 'virtualComponent', 'virtualContext']) {
				vnode[key] = null;
			}
		}());
	}
}
