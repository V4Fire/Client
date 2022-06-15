/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type {

	VNode,
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

	createVNode,
	createStaticVNode,
	createElementVNode,
	createTextVNode,
	createCommentVNode,
	cloneVNode,

	normalizeClass,
	normalizeStyle,
	mergeProps,

	resolveComponent,
	resolveDynamicComponent,
	resolveTransitionHooks,
	resolveDirective,

	withCtx,
	withKeys,
	withModifiers,
	withDirectives,

	vShow,
	vModelText,
	vModelSelect,
	vModelCheckbox,
	vModelRadio,
	vModelDynamic

} from 'vue';

import type { ComponentInterface } from 'core/component/interface';

export interface RenderEngineFeatures {
	regular: boolean;
	functional: boolean;
	ssr: boolean;
}

export interface RenderEngine<T extends object = object> {
	supports: RenderEngineFeatures;
	proxyGetters: ProxyGetters<T>;
	r: RenderAPI;
}

export interface RenderFactory {
	(ctx: ComponentInterface, cache: unknown[]): () => CanArray<VNode>;
}

export interface RenderFn {
	(bindings?: Dictionary): CanArray<VNode>;
}

export interface RenderAPI {
	render(vnode: VNode, parent?: ComponentInterface): Node;
	render(vnode: VNode[], parent?: ComponentInterface): Node[];

	Fragment: typeof Fragment;
	Transition: typeof Transition;
	TransitionGroup: typeof TransitionGroup;

	toHandlers: typeof toHandlers;
	toDisplayString: typeof toDisplayString;

	renderList: typeof renderList;
	renderSlot: typeof renderSlot;

	openBlock: typeof openBlock;
	createBlock: typeof createBlock;
	createElementBlock: typeof createElementBlock;

	createVNode: typeof createVNode;
	createStaticVNode: typeof createStaticVNode;
	createElementVNode: typeof createElementVNode;
	createTextVNode: typeof createTextVNode;
	createCommentVNode: typeof createCommentVNode;
	cloneVNode: typeof cloneVNode;

	normalizeClass: typeof normalizeClass;
	normalizeStyle: typeof normalizeStyle;
	mergeProps: typeof mergeProps;

	resolveComponent: typeof resolveComponent;
	resolveDynamicComponent: typeof resolveDynamicComponent;
	resolveTransitionHooks: typeof resolveTransitionHooks;
	resolveDirective: typeof resolveDirective;

	withCtx: typeof withCtx;
	withAsyncContext<T extends AnyFunction>(awaitable: T): [Awaited<ReturnType<T>>, Function];

	withKeys: typeof withKeys;
	withModifiers: typeof withModifiers;
	withDirectives: typeof withDirectives;

	vShow: typeof vShow;
	vModelText: typeof vModelText;
	vModelSelect: typeof vModelSelect;
	vModelCheckbox: typeof vModelCheckbox;
	vModelRadio: typeof vModelRadio;
	vModelDynamic: typeof vModelDynamic;
}

export type ProxyGetterType =
	'prop' |
	'field' |
	'system' |
	'attr' |
	'mounted';

export type ProxyGetter<T extends object = object> = (ctx: T) => {
	key: string | null;
	value: object;
	watch?(path: string, handler: Function): Function;
};

export type ProxyGetters<T extends object = object> = Record<ProxyGetterType, ProxyGetter<T>>;
