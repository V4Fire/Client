/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import {

	resolveComponent as resolveComponentSuper,
	createVNode as createVNodeSuper,
	withDirectives as withDirectivesSuper

} from 'vue';

import {

	wrapResolveComponent,
	wrapCreateVNode,
	wrapWithDirectives

} from 'core/component/render/wrappers';

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

export const
	resolveComponent = wrapResolveComponent(resolveComponentSuper),
	createVNode = wrapCreateVNode(createVNodeSuper),
	withDirectives = wrapWithDirectives(withDirectivesSuper);
