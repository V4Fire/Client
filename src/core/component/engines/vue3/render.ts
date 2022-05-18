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
	withDirectives as superWithDirectives

} from 'vue';

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

	normalizeClass,
	normalizeStyle,
	mergeProps,

	resolveDirective,
	resolveTransitionHooks,

	withCtx,
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
