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
	 * How the event handler should be called:
	 *
	 * 1. `'post'` - the handler will be called on the next tick after the mutation and
	 *    guaranteed after updating all tied templates;
	 *
	 * 2. `'pre'` - the handler will be called on the next tick after the mutation and
	 *    guaranteed before updating all tied templates;
	 *
	 * 3. `'sync'` - the handler will be invoked immediately after each mutation.
	 */
	flush?: Flush;
}

export interface FieldWatcher<
	A = unknown,
	B = A
> extends WatchOptions {
	/**
	 * A handler that is invoked on watcher events
	 */
	handler: WatchHandler<A, B>;

	/**
	 * If false, the watcher won't be registered for functional components
	 * @default `true`
	 */
	functional?: boolean;

	/**
	 * If false, then the handler that is invoked on the watcher events does not take any arguments from
	 * events it is listening for
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
	 * A name of the group the watcher belongs to.
	 * The parameter is provided to [[Async]].
	 */
	group?: Group;

	/**
	 * A label associated with the watcher.
	 * The parameter is provided to [[Async]].
	 */
	label?: Label;

	/**
	 * A strategy type to join conflict tasks.
	 * The parameter is provided to [[Async]].
	 */
	join?: Join;

	/**
	 * If true, the watcher will be removed from a component after the first calling
	 * @default `false`
	 */
	single?: boolean;

	/**
	 * If false, the watcher won't be registered for functional components
	 * @default `true`
	 */
	functional?: boolean;

	/**
	 * Additional options for the used event emitter
	 */
	options?: Dictionary;

	/**
	 * Additional arguments for the used event emitter
	 */
	args?: unknown[];

	/**
	 * If false, then the handler that is invoked on the watcher events does not take any arguments from
	 * events it is listening for
	 *
	 * @default `true`
	 */
	provideArgs?: boolean;

	/***
	 * A wrapper function for the registered handler
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
	 * A component method name that is registered as a handler to the watcher
	 */
	method?: string;

	/**
	 * A handler (or component method name) that is invoked on watcher events
	 */
	handler: string | WatchHandler<A, B>;
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
	 * A name of the group the watcher belongs to.
	 * The parameter is provided to [[Async]].
	 */
	group?: Group;

	/**
	 * If true, the watcher will be removed from a component after the first calling
	 * @default `false`
	 */
	single?: boolean;

	/**
	 * If false, the watcher won't be registered for functional components
	 * @default `true`
	 */
	functional?: boolean;

	/**
	 * Additional options for the used event emitter
	 */
	options?: Dictionary;

	/**
	 * Additional arguments for the used event emitter
	 */
	args?: CanArray<unknown>;

	/**
	 * If false, then the handler that is invoked on the watcher events does not take any arguments from
	 * events it is listening for
	 *
	 * @default `true`
	 */
	provideArgs?: boolean;

	/***
	 * A wrapper function for the registered handler
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
