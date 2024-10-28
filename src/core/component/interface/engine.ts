/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type {

	VNode,

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

	renderList,
	renderSlot,

	openBlock,
	createBlock,
	setBlockTracking,
	createElementBlock,

	cloneVNode,
	createVNode,
	createStaticVNode,
	createElementVNode,
	createTextVNode,
	createCommentVNode,

	setDevtoolsHook,
	setTransitionHooks,
	useTransitionState,

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

} from 'core/component/engines';

import type { ComponentInterface } from 'core/component/interface';

export type { SetupContext } from 'core/component/engines';

export interface RenderEngine<T extends object = object> {
	supports: RenderEngineFeatures;
	proxyGetters: ProxyGetters<T>;
	r: RenderAPI;
	wrapAPI<T extends Dictionary>(this: ComponentInterface, path: string, api: T): T;
}

export interface RenderEngineFeatures {

}

export type ProxyGetters<T extends object = object> = Record<ProxyGetterType, ProxyGetter<T>>;

export type ProxyGetter<T extends object = object> = (ctx: T) => {
	key: string | null;
	value: object;
	watch?(path: string, handler: Function): Function;
};

export type ProxyGetterType =
	'prop' |
	'field' |
	'system' |
	'attr' |
	'mounted';

export interface RenderAPI {
	render(vnode: VNode, parent?: ComponentInterface, group?: string): Node;
	render(vnode: VNode[], parent?: ComponentInterface, group?: string): Node[];
	destroy(vnode: Node | VNode): void;

	getCurrentInstance: typeof getCurrentInstance;

	Static: typeof Static;
	Comment: typeof Comment;

	Suspense: typeof Suspense;
	Fragment: typeof Fragment;
	Teleport: typeof Teleport;

	Transition: typeof Transition;
	TransitionGroup: typeof TransitionGroup;

	toHandlers: typeof toHandlers;
	toHandlerKey: typeof toHandlerKey;
	toDisplayString: typeof toDisplayString;

	renderList: typeof renderList;
	renderSlot: typeof renderSlot;

	openBlock: typeof openBlock;
	createBlock: typeof createBlock;
	setBlockTracking: typeof setBlockTracking;
	createElementBlock: typeof createElementBlock;

	createVNode: typeof createVNode;
	createStaticVNode: typeof createStaticVNode;
	createElementVNode: typeof createElementVNode;
	createTextVNode: typeof createTextVNode;
	createCommentVNode: typeof createCommentVNode;
	cloneVNode: typeof cloneVNode;

	setDevtoolsHook: typeof setDevtoolsHook;
	setTransitionHooks: typeof setTransitionHooks;
	useTransitionState: typeof useTransitionState;

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

export interface RenderFactory {
	(ctx: ComponentInterface, cache: unknown[]): () => CanArray<VNode>;
}

export interface RenderFn {
	(bindings?: Dictionary): CanArray<VNode>;
}
