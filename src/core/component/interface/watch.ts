/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { WatchPath as RawWatchPath, WatchOptions, WatchHandlerParams } from 'core/object/watch';
import type { Group, Label, Join } from 'core/async';

import type { PropertyInfo } from 'core/component/reflection';
import type { ComponentInterface } from 'core/component/interface/component';

export { WatchOptions, WatchHandlerParams };

export interface FieldWatcher<
	A = unknown,
	B = A
> extends WatchOptions {
	/**
	 * Handler that is invoked on watcher events
	 */
	handler: WatchHandler<A, B>;

	/**
	 * If false, the watcher won't be registered for functional/flyweight components
	 * @default `true`
	 */
	functional?: boolean;

	/**
	 * If false, then the handler that is invoked on watcher events does not take any arguments from the event
	 * @default `true`
	 */
	provideArgs?: boolean;
}

export interface WatchObject<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> extends WatchOptions {
	/**
	 * Group name of a watcher
	 * (provided to Async)
	 */
	group?: Group;

	/**
	 * Label of a watcher
	 * (provided to Async)
	 */
	label?: Label;

	/**
	 * Join strategy of a watcher
	 * (provided to Async)
	 */
	join?: Join;

	/**
	 * If true, the watcher will be removed from a component after the first calling
	 * @default `false`
	 */
	single?: boolean;

	/**
	 * If false, the watcher won't be registered for functional/flyweight components
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
	 * If false, then the handler that is invoked on watcher events does not take any arguments from the event
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
	handler: string | WatchHandler<A, B>;
}

export interface MethodWatcher<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> extends WatchOptions {
	/**
	 * Path to a component property to watch or event to listen
	 */
	path?: string;

	/**
	 * Group name of the watcher
	 * (provided to Async)
	 */
	group?: Group;

	/**
	 * If true, the watcher will be removed from a component after the first calling
	 * @default `false`
	 */
	single?: boolean;

	/**
	 * If false, the watcher won't be registered for functional/flyweight components
	 * @default `true`
	 */
	functional?: boolean;

	/**
	 * Additional options for an event emitter
	 * (only if you listen an event)
	 */
	options?: Dictionary;

	/**
	 * Additional arguments for the operation (their provides to an event emitter when attaching listeners)
	 */
	args?: CanArray<unknown>;

	/**
	 * If false, then the handler that is invoked on watcher events does not take any arguments from the event
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

export type WatchPath =
	string |
	PropertyInfo |
	{ctx: object; path?: RawWatchPath};

export interface RawWatchHandler<CTX extends ComponentInterface = ComponentInterface, A = unknown, B = A> {
	(a: A, b?: B, params?: WatchHandlerParams): AnyToIgnore;
	(this: CTX, a: A, b?: B, params?: WatchHandlerParams): AnyToIgnore;
}

export interface WatchHandler<A = unknown, B = A> {
	(a: A, b: B, params?: WatchHandlerParams): unknown;
	(...args: A[]): unknown;
}

export interface WatchWrapper<CTX extends ComponentInterface = ComponentInterface, A = unknown, B = A> {
	(ctx: CTX['unsafe'], handler: WatchHandler<A, B>): CanPromise<WatchHandler<A, B> | Function>;
}
