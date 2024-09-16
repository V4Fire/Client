/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type {

	WatchPath as RawWatchPath,
	WatchOptions as RawWatchOptions,
	WatchHandlerParams

} from 'core/object/watch';

import type { Group, Label, Join } from 'core/async';

import type { PropertyInfo } from 'core/component/reflect';
import type { ComponentInterface } from 'core/component/interface/component';

export { WatchHandlerParams };

export type Flush = 'post' | 'pre' | 'sync';

export interface WatchOptions extends RawWatchOptions {
	/**
	 * Options for invoking the event handler:
	 *
	 * 1. 'post' - the handler will be called on the next tick following the mutation, ensuring
	 *    that all tied templates are rendered;
	 *
	 * 2. 'pre' - the handler will be called on the next tick following the mutation, ensuring
	 *    that it occurs before rendering all tied templates;
	 *
	 * 3. 'sync' - the handler will be invoked immediately after each mutation.
	 */
	flush?: Flush;
}

export interface FieldWatcher<
	A = unknown,
	B = A
> extends WatchOptions {
	/**
	 * This handler is called when a watcher event occurs
	 */
	handler: WatchHandler<A, B>;

	/**
	 * If set to false, the watcher will not be registered for functional components
	 * @default `true`
	 */
	functional?: boolean;

	/**
	 * If set to false, the handler triggered by watcher events will not receive any arguments
	 * from the events it is set to listen for
	 *
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
	 * The name of the group to which the watcher belongs.
	 * This parameter is passed to the [[Async]].
	 */
	group?: Group;

	/**
	 * A label that is associated with the watcher.
	 * This parameter is passed to the [[Async]].
	 */
	label?: Label;

	/**
	 * A strategy type that determines how conflicts between tasks should be handled during a join operation.
	 * This parameter is passed to the [[Async]].
	 */
	join?: Join;

	/**
	 * If set to true, the watcher will be removed from the component after the first invocation
	 * @default `false`
	 */
	single?: boolean;

	/**
	 * If set to false, the watcher will not be registered for functional components
	 * @default `true`
	 */
	functional?: boolean;

	/**
	 * An object with additional settings for the event emitter
	 */
	options?: Dictionary;

	/**
	 * Additional arguments that will be passed to the event emitter when registering a handler for the specified event
	 */
	args?: unknown[];

	/**
	 * If set to false, the handler triggered by watcher events will not receive any arguments
	 * from the events it is set to listen for
	 *
	 * @default `true`
	 */
	provideArgs?: boolean;

	/**
	 * A function that wraps the registered handler
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
	 * The name of a component method that is registered as a handler for the watcher
	 */
	method?: string;

	/**
	 * A handler, or the name of a component's method, that gets invoked upon watcher events
	 */
	handler: string | WatchHandler<A, B>;

	/**
	 * A function to determine whether a watcher should be initialized or not.
	 * If the function returns false, the watcher will not be initialized.
	 * Useful for precise component optimizations.
	 *
	 * @param ctx
	 */
	shouldInit?(ctx: CTX): boolean;
}

export interface MethodWatcher<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> extends WatchOptions {
	/**
	 * A path to a component property to watch or event to listen
	 */
	path?: string;

	/**
	 * The name of the group to which the watcher belongs.
	 * This parameter is passed to the [[Async]].
	 */
	group?: Group;

	/**
	 * If set to true, the watcher will be removed from the component after the first invocation
	 * @default `false`
	 */
	single?: boolean;

	/**
	 * If set to false, the watcher will not be registered for functional components
	 * @default `true`
	 */
	functional?: boolean;

	/**
	 * A function to determine whether a watcher should be initialized or not.
	 * If the function returns false, the watcher will not be initialized.
	 * Useful for precise component optimizations.
	 *
	 * @param ctx
	 */
	shouldInit?(ctx: CTX): boolean;

	/**
	 * An object with additional settings for the event emitter
	 */
	options?: Dictionary;

	/**
	 * Additional arguments that will be passed to the event emitter when registering a handler for the specified event
	 */
	args?: CanArray<unknown>;

	/**
	 * If set to false, the handler triggered by watcher events will not receive any arguments
	 * from the events it is set to listen for
	 *
	 * @default `true`
	 */
	provideArgs?: boolean;

	/**
	 * A function that wraps the registered handler
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
	(a: A, b?: B, params?: WatchHandlerParams): void;
	(this: CTX, a: A, b?: B, params?: WatchHandlerParams): void;
}

export interface WatchHandler<A = unknown, B = A> {
	(a: A, b: B, params?: WatchHandlerParams): unknown;
	(...args: A[]): unknown;
}

export interface WatchWrapper<CTX extends ComponentInterface = ComponentInterface, A = unknown, B = A> {
	(ctx: CTX['unsafe'], handler: WatchHandler<A, B>): CanPromise<WatchHandler<A, B> | Function>;
}
