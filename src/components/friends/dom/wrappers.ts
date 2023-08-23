/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { asyncOptionsKeys, AsyncOptions } from 'core/async';

import { elementClasses } from 'components/friends/provide';
import { wrapAsDelegateHandler } from 'core/dom';

import * as ResizeWatcher from 'core/dom/resize-watcher';
import * as IntersectionWatcher from 'core/dom/intersection-watcher';

import type Friend from 'components/friends/friend';

/**
 * Wraps the specified function as an event handler with delegation.
 * In simple terms, the wrapped function will be executed only if the event happened on the element by the given
 * selector or in its descendant node. Also, the function adds to the event object a reference to the element to which
 * the selector is specified.
 *
 * @param selector - a selector to the elements on which you want to catch the event
 * @param fn - the original function
 *
 * @example
 * ```js
 * el.addEventListener('click', this.delegate('.foo', (e) => {
 *   console.log(e.delegateTarget);
 * }));
 * ```
 */
export function delegate<T extends Function>(selector: string, fn: T): T {
	return wrapAsDelegateHandler(selector, fn);
}

/**
 * Wraps the specified function as an event handler with component element delegation.
 * In simple terms, the wrapped function will be executed only if the event happened on the element by the name or
 * in its descendant node. Also, the function adds to the event object a reference to the element to which the selector
 * is specified.
 *
 * @param name - the element name on which you want to catch the event
 * @param fn - the original function
 *
 * @example
 * ```js
 * el.addEventListener('click', this.delegateElement('myElement', (e) => {
 *   console.log(e.delegateTarget);
 * }));
 * ```
 */
export function delegateElement<T extends Function>(this: Friend, name: string, fn: T): T {
	return delegate([''].concat(elementClasses.call(this, {[name]: {}})).join('.'), fn);
}

/**
 * Tracks the intersection of the passed element with the viewport by using the `core/dom/intersection-watcher` module,
 * and invokes the specified handler each time the element enters the viewport.
 * The function returns a destructor to cancel the watching.
 *
 * @param el - the element to watch
 * @param handler - a function that will be called when the element enters the viewport
 */
export function watchForIntersection(
	this: Friend,
	el: Element,
	handler: IntersectionWatcher.WatchHandler
): Function;

/**
 * Tracks the intersection of the passed element with the viewport by using the `core/dom/intersection-watcher` module,
 * and invokes the specified handler each time the element enters the viewport.
 * The function returns a destructor to cancel the watching.
 *
 * @param el - the element to watch
 * @param opts - additional watch options
 * @param handler - a function that will be called when the element enters the viewport
 */
export function watchForIntersection(
	this: Friend,
	el: Element,
	opts: IntersectionWatcher.WatchOptions & AsyncOptions,
	handler: IntersectionWatcher.WatchHandler
): Function;

export function watchForIntersection(
	this: Friend,
	el: Element,
	handlerOrOpts: IntersectionWatcher.WatchHandler | IntersectionWatcher.WatchOptions & AsyncOptions,
	handler?: IntersectionWatcher.WatchHandler
): Function {
	const
		{async: $a} = this.ctx;

	let
		opts: Nullable<IntersectionWatcher.WatchOptions & AsyncOptions>;

	if (Object.isFunction(handlerOrOpts)) {
		handler = handlerOrOpts;
		opts = {};

	} else {
		opts = handlerOrOpts;
	}

	const
		asyncOpts = Object.select(opts, asyncOptionsKeys),
		watcherOpts = Object.reject(opts, asyncOptionsKeys);

	const destructor = $a.worker(() => IntersectionWatcher.unwatch(el, handler), asyncOpts);
	IntersectionWatcher.watch(el, watcherOpts, handler);

	return () => $a.clearWorker(destructor);
}

/**
 * Watches for the size of the given element by using the `core/dom/resize-observer` module and
 * invokes the specified handler when it changes. The function returns a destructor to cancel the watching.
 *
 * Note, changes occurring at the same tick are merged into one.
 * You can disable this behavior by passing the `immediate: true` option.
 *
 * @param el - the element to watch
 * @param handler - a function that will be called when the observable element is resized
 */
export function watchForResize(
	this: Friend,
	el: Element,
	handler: ResizeWatcher.WatchHandler
): Function;

/**
 * Watches for the size of the given element by using the `core/dom/resize-observer` module and
 * invokes the specified handler when it changes. The function returns a destructor to cancel the watching.
 *
 * Note, changes occurring at the same tick are merged into one.
 * You can disable this behavior by passing the `immediate: true` option.
 *
 * @param el - the element to watch
 * @param opts - additional watch options
 * @param handler - a function that will be called when the observable element is resized
 */
export function watchForResize(
	this: Friend,
	el: Element,
	opts: ResizeWatcher.WatchOptions & AsyncOptions,
	handler: ResizeWatcher.WatchHandler
): Function;

export function watchForResize(
	this: Friend,
	el: Element,
	handlerOrOpts: ResizeWatcher.WatchHandler | ResizeWatcher.WatchOptions & AsyncOptions,
	handler?: ResizeWatcher.WatchHandler
): Function {
	const
		{async: $a} = this.ctx;

	let
		opts: ResizeWatcher.WatchOptions & AsyncOptions;

	if (Object.isFunction(handlerOrOpts)) {
		handler = handlerOrOpts;
		opts = {};

	} else {
		opts = handlerOrOpts;
	}

	const
		asyncOpts = Object.select(opts, asyncOptionsKeys),
		watcherOpts = Object.reject(opts, asyncOptionsKeys);

	const destructor = $a.worker(() => ResizeWatcher.unwatch(el, handler), asyncOpts);
	ResizeWatcher.watch(el, watcherOpts, handler);

	return () => $a.clearWorker(destructor);
}
