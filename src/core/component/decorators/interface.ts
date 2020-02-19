/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

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

export interface FieldWatcherObject<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> extends WatchOptions {
	fn: string | WatchHandler<CTX, A, B>;
	provideArgs?: boolean;
}

export type FieldWatcher<CTX extends ComponentInterface = ComponentInterface, A = unknown, B = A> =
	string |
	FieldWatcherObject<CTX, A, B> |
	WatchHandler<CTX, A, B> |
	Array<string | FieldWatcherObject<CTX, A, B> | WatchHandler<CTX, A, B>>;

export interface ComponentProp<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> extends PropOptions {
	forceDefault?: boolean;
	watch?: FieldWatcher<CTX, A, B>;
	meta?: Dictionary;
}

export interface SystemField<CTX extends ComponentInterface = ComponentInterface> extends FunctionalOptions {
	atom?: boolean;
	default?: unknown;
	unique?: boolean | UniqueFieldFn<CTX>;
	after?: CanArray<string>;
	init?: InitFieldFn<CTX>;
	merge?: MergeFieldFn<CTX> | boolean;
	meta?: Dictionary;
}

export interface ComponentField<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> extends SystemField<CTX> {
	watch?: FieldWatcher<CTX, A, B>;
}

export interface FunctionalOptions {
	replace?: boolean;
	functional?: boolean;
}

export interface ComponentAccessor extends FunctionalOptions {
	cache: boolean;
}

export type HookParams = {
	[hook in Hook]?: FunctionalOptions & {
		after?: CanArray<string>;
	}
};

export type ComponentHooks =
	Hook |
	Hook[] |
	HookParams |
	HookParams[];

export type MethodWatchers<CTX extends ComponentInterface = ComponentInterface, A = unknown, B = A> =
	string |
	MethodWatcher<CTX, A, B> |
	Array<string | MethodWatcher<CTX, A, B>>;

export interface ComponentMethod<CTX extends ComponentInterface = ComponentInterface, A = unknown, B = A> {
	watch?: MethodWatchers<CTX, A, B>;
	watchParams?: MethodWatcher<CTX, A, B>;
	hook?: ComponentHooks;
}
