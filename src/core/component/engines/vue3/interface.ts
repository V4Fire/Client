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

	VNode,
	DirectiveBinding,
	FunctionDirective

} from 'vue';

export interface ObjectDirective<T = any, V = any> extends SuperObjectDirective<T, V> {
	beforeCreate?(binding: DirectiveBinding<V>, vnode: VNode<any, T>): void;
}

export declare type Directive<T = any, V = any> = ObjectDirective<T, V> | FunctionDirective<T, V>;

export interface CreateAppFunction<E = Element> {
	(...args: Parameters<SuperCreateAppFunction<E>>): Overwrite<SuperCreateAppFunction<E>, {
		directive(name: string): CanUndef<Directive>;
		directive(name: string, directive: Directive): ReturnType<CreateAppFunction<E>>;
	}>;
}
