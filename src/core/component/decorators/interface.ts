/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { WatchPath } from 'core/object/watch';
import { WatchOptions } from 'core/component/engines';

import {

	PropOptions,
	ComponentInterface,
	Hook,

	InitFieldFn,
	MergeFieldFn,
	UniqueFieldFn,

	MethodWatcher,
	WatchHandler

} from 'core/component/interface';

export interface DecoratorFieldWatcherObject<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> extends WatchOptions {
	fn: string | WatchHandler<CTX, A, B>;
	provideArgs?: boolean;
}

export type DecoratorFieldWatcher<CTX extends ComponentInterface = ComponentInterface, A = unknown, B = A> =
	string |
	DecoratorFieldWatcherObject<CTX, A, B> |
	WatchHandler<CTX, A, B> |
	Array<string | DecoratorFieldWatcherObject<CTX, A, B> | WatchHandler<CTX, A, B>>;

export interface DecoratorProp<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> extends PropOptions {
	forceDefault?: boolean;
	watch?: DecoratorFieldWatcher<CTX, A, B>;
	meta?: Dictionary;
}

export interface DecoratorSystem<
	CTX extends ComponentInterface = ComponentInterface
> extends DecoratorFunctionalOptions {
	atom?: boolean;
	default?: unknown;
	unique?: boolean | UniqueFieldFn<CTX>;
	after?: CanArray<string>;
	init?: InitFieldFn<CTX>;
	merge?: MergeFieldFn<CTX> | boolean;
	meta?: Dictionary;
}

export interface DecoratorField<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> extends DecoratorSystem<CTX> {
	watch?: DecoratorFieldWatcher<CTX, A, B>;
}

export interface DecoratorFunctionalOptions {
	replace?: boolean;
	functional?: boolean;
}

export interface DecoratorComponentAccessor extends DecoratorFunctionalOptions {
	cache?: boolean;
	dependencies?: WatchPath[];
}

export type DecoratorHookParams = {
	[hook in Hook]?: DecoratorFunctionalOptions & {
		after?: CanArray<string>;
	}
};

export type DecoratorHook =
	Hook |
	Hook[] |
	DecoratorHookParams |
	DecoratorHookParams[];

export type DecoratorMethodWatchers<CTX extends ComponentInterface = ComponentInterface, A = unknown, B = A> =
	string |
	MethodWatcher<CTX, A, B> |
	Array<string | MethodWatcher<CTX, A, B>>;

export interface DecoratorMethod<CTX extends ComponentInterface = ComponentInterface, A = unknown, B = A> {
	watch?: DecoratorMethodWatchers<CTX, A, B>;
	watchParams?: MethodWatcher<CTX, A, B>;
	hook?: DecoratorHook;
}

export interface ParamsFactoryTransformer {
	(params: object, cluster: string): Dictionary<any>
}

export interface FactoryTransformer<T = object> {
	(params?: T): Function;
}
