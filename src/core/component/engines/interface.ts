/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type {

	CreateAppFunction as SuperCreateAppFunction,
	ObjectDirective as SuperObjectDirective,
	VNode as SuperVNode,

	DirectiveBinding as SuperDirectiveBinding,
	FunctionDirective

} from 'vue';

import type { RendererElement, RendererNode } from 'core/component/engines';
import type { ComponentInterface } from 'core/component/interface';

//#if @ignore
export * from '@vue/runtime-dom';
//#endif

export interface VNodeVirtualParent {
	value: CanNull<ComponentInterface>;
}

export type VNode<
	HostNode = RendererNode,
	HostElement = RendererElement,
	ExtraProps = {[key: string]: any}
> = Overwrite<SuperVNode<HostNode, HostElement, ExtraProps>, {
	ignore?: boolean;
	skipDestruction?: boolean;
	dynamicProps?: string[];
	dynamicChildren?: VNode[];
	virtualContext?: ComponentInterface;
	virtualComponent?: ComponentInterface;
	virtualParent?: VNodeVirtualParent;
	ref: SuperVNode['ref'] & Nullable<{i?: Nullable<{refs: Dictionary; setupState?: Dictionary}>}>;
}>;

export interface ResolveDirective<E = Element> {
	directive(name: string): CanUndef<Directive>;
	directive(name: string, directive: Directive): ReturnType<CreateAppFunction<E>>;
}

export interface DirectiveBinding<T = any> extends SuperDirectiveBinding<T> {
	virtualContext?: ComponentInterface;
	virtualComponent?: ComponentInterface;
}

export interface ObjectDirective<T = any, V = any> extends SuperObjectDirective<T, V> {
	beforeCreate?(
		this: ResolveDirective & ObjectDirective<T, V>,
		binding: DirectiveBinding<V>,
		vnode: VNode<any, T>
	): CanVoid<VNode>;
}

export declare type Directive<T = any, V = any> =
	ObjectDirective<T, V> |
	FunctionDirective<T, V>;

export declare type DirectiveArguments = Array<
	[Directive] |
	[Directive, any] |
	[Directive, any, string] |
	[Directive, any, string, Record<string, boolean>]
>;

export interface CreateAppFunction<E = Element> {
	(...args: Parameters<SuperCreateAppFunction<E>>): Overwrite<
		ReturnType<SuperCreateAppFunction<E>>,
		ResolveDirective<E>
	>;
}

export type SSRBuffer = SSRBufferItem[] & {
    hasAsync?: boolean;
};

export type SSRBufferItem = string | SSRBuffer | Promise<SSRBuffer>;
