/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { Group, Label, Join } from 'core/async';
import { WatchOptions, WatchHandlerParams  } from 'core/object/watch';
import { PropertyInfo } from 'core/component/reflection';
import { ComponentInterface } from 'core/component/interface';

export { WatchOptions, WatchHandlerParams };

export type WatchPath<CTX extends ComponentInterface = ComponentInterface> =
	string |
	PropertyInfo;

export interface RawWatchHandler<CTX extends ComponentInterface = ComponentInterface, A = unknown, B = A> {
	(a: A, b?: B, params?: WatchHandlerParams): any;
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
	/**
	 * Handler that is invoked on watcher events
	 */
	fn: WatchHandler<CTX, A, B>;

	/**
	 * If false, the watcher won't registered for functional/flyweight components
	 * @default `true`
	 */
	functional?: boolean;

	/**
	 * If false, then the handler that is invoked on watcher events doesn't take any arguments from an event
	 * @default `true`
	 */
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
	/**
	 * Group name of a watcher
	 * (for Async)
	 */
	group?: Group;

	/**
	 * Label of a watcher
	 * (for Async)
	 */
	label?: Label;

	/**
	 * Join strategy of a watcher
	 * (for Async)
	 */
	join?: Join;

	/**
	 * If true, the watcher will be removed from a component after the first calling
	 * @default `false`
	 */
	single?: boolean;

	/**
	 * If false, the watcher won't registered for functional/flyweight components
	 * @default `true`
	 */
	functional?: boolean;

	/**
	 * Additional options for an event emitter
	 * (only if you listen an event)
	 */
	options?: Dictionary;

	/**
	 * A name of a component method that is registered as a handler to the watcher
	 */
	method?: string;

	/**
	 * Additional arguments to the operation
	 */
	args?: unknown[];

	/**
	 * If false, then the handler that is invoked on watcher events doesn't take any arguments from an event
	 * @default `true`
	 */
	provideArgs?: boolean;

	/***
	 * Wrapper for a handler
	 *
	 * @example
	 * ```typescript
	 * @component()
	 * class Foo extends iBlock {
	 *   @watch({
	 *     path: '?$el:click',
	 *     wrapper: (ctx, cb) => ctx.dom.delegateElement('bla', cb)
	 *   })
	 *
	 *   onClick() {
	 *
	 *   }
	 * }
	 * ```
	 */
	wrapper?: WatchWrapper<CTX, A, B>;

	/**
	 * Handler (or a name of a component method) that is invoked on watcher events
	 */
	handler: string | WatchHandler<CTX, A, B>;
}

export interface MethodWatcher<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> extends WatchOptions {
	/**
	 * @deprecated
	 * @see [[MethodWatcher.path]]
	 */
	field?: string;

	/**
	 * Path to a component property to watch or an event to listen
	 */
	path?: string;

	/**
	 * Group name of a watcher
	 * (for Async)
	 */
	group?: Group;

	/**
	 * If true, the watcher will be removed from a component after the first calling
	 * @default `false`
	 */
	single?: boolean;

	/**
	 * If false, the watcher won't registered for functional/flyweight components
	 * @default `true`
	 */
	functional?: boolean;

	/**
	 * Additional options for an event emitter
	 * (only if you listen an event)
	 */
	options?: Dictionary;

	/**
	 * Additional arguments to the operation
	 */
	args?: CanArray<unknown>;

	/**
	 * If false, then the handler that is invoked on watcher events doesn't take any arguments from an event
	 * @default `true`
	 */
	provideArgs?: boolean;

	/***
	 * Wrapper for a handler
	 *
	 * @example
	 * ```typescript
	 * @component()
	 * class Foo extends iBlock {
	 *   @watch({
	 *     path: '?$el:click',
	 *     wrapper: (ctx, cb) => ctx.dom.delegateElement('bla', cb)
	 *   })
	 *
	 *   onClick() {
	 *
	 *   }
	 * }
	 * ```
	 */
	wrapper?: WatchWrapper<CTX, A, B>;
}
