/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { EventEmitterLikeP, PromiseLikeP } from 'core/async';

import type { DirectiveBinding } from 'core/component/engines';
import type { WatchOptions } from 'core/component/interface';

export interface DirectiveParams extends DirectiveBinding<CanUndef<DirectiveValue>> {}

export type DirectiveValue = CanArray<Listener>;

export type Listener<A extends any[] = any[], E extends any[] = any[]> =
	PathListener<A> |
	EventListener<A> |
	PromiseListener<A, E> |
	CallbackListener<A, E>;

export interface Handle<A extends any[]> {
	/**
	 * A function to handle listeners
	 *
	 * @param el
	 * @param args
	 */
	then(el: Element, ...args: A): void;

	/**
	 * A group name to manual clearing of pending tasks via the [[Async]] module
	 */
	group?: string;
}

export interface ErrorHandle<A extends any[], E extends any[]> extends Handle<A> {
	/**
	 * A function to handle errors
	 *
	 * @param el
	 * @param args
	 */
	catch?(el: Element, ...args: E): void;
}

export interface PathListener<A extends any[]> extends Handle<A> {
	/**
	 * A path to the watched property
	 */
	path: string;

	/**
	 * Additional options for the watcher
	 */
	options?: WatchOptions;
}

export interface EventListener<A extends any[]> extends Handle<A> {
	/**
	 * An event emitter to listen
	 */
	emitter?: EventEmitterLikeP;

	/**
	 * The event name to listen for, or a list of such events
	 */
	on?: CanArray<string>;

	/**
	 * The name of the event to listen for once, or a list of such events
	 */
	once?: CanArray<string>;

	/**
	 * Additional options for the emitter
	 */
	options?: Dictionary;
}

export interface CallbackListener<A extends any[], E extends any[]> extends ErrorHandle<A, E> {
	/**
	 * A function to add handlers
	 *
	 * @param handler
	 * @param [errorHandler]
	 */
	callback(handler: AnyFunction, errorHandler?: AnyFunction): void;
}

export interface PromiseListener<A extends any[], E extends any[]> extends ErrorHandle<A, E> {
	/**
	 * A promise to process, or a function that returns one
	 */
	promise: PromiseLikeP;
}
