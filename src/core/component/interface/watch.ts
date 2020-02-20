/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ComponentInterface } from 'core/component/interface';

export type WatchExpr<CTX extends ComponentInterface = ComponentInterface> =
	string |
	((this: CTX) => string);

export interface RawWatchHandler<CTX extends ComponentInterface = ComponentInterface, V = unknown> {
	(this: this, n: V, o?: V): any;
}

export interface WatchOptions {
	deep?: boolean;
	immediate?: boolean;
}

export interface WatchHandler<CTX extends ComponentInterface = ComponentInterface, A = unknown, B = A> {
	(a: A, b: B): unknown;
	(...args: A[]): unknown;
	(ctx: CTX, a: A, b: B): unknown;
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
