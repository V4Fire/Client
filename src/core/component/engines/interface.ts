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

	DirectiveBinding,
	FunctionDirective

} from 'vue';

import type { RendererElement, RendererNode } from 'core/component/engines';
import type { ComponentInterface } from 'core/component/interface';

//#if @ignore
export * from '@vue/runtime-dom';
//#endif

export interface VNode<
	HostNode = RendererNode,
	HostElement = RendererElement,
	ExtraProps = {[key: string]: any}
> extends SuperVNode<HostNode, HostElement, ExtraProps> {
	fakeContext?: ComponentInterface;
}

export interface ResolveDirective<E = Element> {
	directive(name: string): CanUndef<Directive>;
	directive(name: string, directive: Directive): ReturnType<CreateAppFunction<E>>;
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
