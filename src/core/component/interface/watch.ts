/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { WatchOptions, WatchHandlerParams  } from 'core/object/watch';
import { PropertyInfo } from 'core/component/reflection';
import { ComponentInterface } from 'core/component/interface';

export { WatchOptions, WatchHandlerParams };

export type WatchPath<CTX extends ComponentInterface = ComponentInterface> =
	string |
	PropertyInfo;

export interface RawWatchHandler<CTX extends ComponentInterface = ComponentInterface, A = unknown, B = A> {
	(this: this, a: A, b?: B, params?: WatchHandlerParams): any;
}

export interface WatchHandler<CTX extends ComponentInterface = ComponentInterface, A = unknown, B = A> {
	(a: A, b: B, params?: WatchHandlerParams): unknown;
	(...args: A[]): unknown;
	(ctx: CTX, a: A, b: B, params?: WatchHandlerParams): unknown;
	(ctx: CTX, ...args: A[]): unknown;
}

export interface FieldWatcher<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> extends WatchOptions {
	fn: WatchHandler<CTX, A, B>;
	functional?: boolean;
	provideArgs?: boolean;
}

export interface WatchWrapper<CTX extends ComponentInterface = ComponentInterface, A = unknown, B = A> {
	(ctx: CTX, handler: WatchHandler<CTX, A, B>): CanPromise<WatchHandler<CTX, A, B> | Function>;
}

export interface WatchObject<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> extends WatchOptions {
	join?: boolean | 'replace';
	label?: string | symbol;
	group?: string;
	single?: boolean;
	functional?: boolean;
	options?: AddEventListenerOptions;
	method?: string;
	args?: unknown[];
	provideArgs?: boolean;
	wrapper?: WatchWrapper<CTX, A, B>;
	handler: string | WatchHandler<CTX, A, B>;
}

export interface MethodWatcher<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> extends WatchOptions {
	field?: string;
	group?: string;
	single?: boolean;
	functional?: boolean;
	options?: AddEventListenerOptions;
	args?: CanArray<unknown>;
	provideArgs?: boolean;
	wrapper?: WatchWrapper<CTX, A, B>;
}
