/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { EventEmitterLike, PromiseLikeP } from 'core/async';

import type { DirectiveBinding } from 'core/component/engines';
import type { WatchOptions } from 'core/component/interface';

export interface DirectiveOptions extends DirectiveBinding<CanUndef<DirectiveValue>> {}

export type DirectiveValue = CanArray<Binding>;

export type Binding<A extends any[] = any[], E extends any[] = any[]> =
	PathBinding<A> |
	EventBinding<A> |
	PromiseBinding<A, E> |
	CallbackBinding<A, E>;

export interface Handle<A extends any[]> {
	/**
	 * A function to handle listeners
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
	 */
	catch?(el: Element, ...args: E): void;
}

export interface PathBinding<A extends any[]> extends Handle<A> {
	/**
	 * A path to the watched property
	 */
	path: string;

	/**
	 * Additional options for the watcher
	 */
	options?: WatchOptions;
}

export interface EventBinding<A extends any[]> extends Handle<A> {
	/**
	 * An event emitter to listen
	 */
	emitter?: EventEmitterLike;

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

export interface CallbackBinding<A extends any[], E extends any[]> extends ErrorHandle<A, E> {
	/**
	 * A function to add handlers
	 */
	callback(handler: AnyFunction, errorHandler?: AnyFunction): void;
}

export interface PromiseBinding<A extends any[], E extends any[]> extends ErrorHandle<A, E> {
	/**
	 * A promise to process, or a function that returns one
	 */
	promise: PromiseLikeP;
}
