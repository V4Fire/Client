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
	withDirectives as superWithDirectives

} from 'vue';

import {

	interpolateStaticAttrs,

	wrapResolveComponent,
	wrapCreateVNode,
	wrapWithDirectives

} from 'core/component/render';

export {

	Fragment,
	Transition,
	TransitionGroup,

	toHandlers,
	toDisplayString,

	renderList,
	renderSlot,

	openBlock,
	createBlock,
	createElementBlock,

	createElementVNode,
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
	resolveDynamicComponent = wrapResolveComponent(superResolveDynamicComponent),
	createVNode = wrapCreateVNode(superCreateVNode),
	withDirectives = wrapWithDirectives(superWithDirectives);
