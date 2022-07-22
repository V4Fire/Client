/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/dom/resize-watcher/README.md]]
 * @packageDocumentation
 */

import * as support from 'core/const/support';

import { asyncTasks, registeredWatchers } from 'core/dom/resize-watcher/const';
import { shouldInvokeHandler } from 'core/dom/resize-watcher/helpers';

import type { Watcher, WatchOptions, WatchHandler } from 'core/dom/resize-watcher/interface';

export * from 'core/dom/resize-watcher/const';
export * from 'core/dom/resize-watcher/interface';

/**
 * Watches for the geometry of the passed element and invokes the specified handler when it changes.
 * The function returns a special watcher object that can be used to cancel the watching.
 *
 * Note, changes occurring in the same tick are merged into one. You can disable this behavior by passing
 * the `immediate: true` option.
 *
 * @param el - the element to observe
 * @param handler - a function that will be called when the size of the observable element is changed
 */
export function watch(el: Element, handler: WatchHandler): Watcher;

/**
 * Watches for the geometry of the passed element and invokes the specified handler when it changes.
 * The function returns a special watcher object that can be used to cancel the watching.
 *
 * Note, changes occurring in the same tick are merged into one. You can disable this behavior by passing
 * the `immediate: true` option.
 *
 * @param el - the element to observe
 * @param opts - additional observation options
 * @param handler - a function that will be called when the size of the observable element is changed
 *
 * @example
 * ```js
 * import * as ResizeWatcher from 'core/dom/resize-watcher';
 *
 * const watcher = ResizeWatcher.watch(document.body, {box: 'border-box'}, (newGeometry, oldGeometry, watcher) => {
 *   console.log('The element has been resized', newGeometry, oldGeometry);
 * });
 *
 * watcher.unwatch();
 * ```
 */
export function watch(el: Element, opts: WatchOptions, handler: WatchHandler): Watcher;

export function watch(
	el: Element,
	optsOrHandler?: WatchHandler | WatchOptions,
	handler?: WatchHandler
): Watcher {
	const opts = {
		watchWidth: true,
		watchHeight: true,
		immediate: false,
		watchInit: true,
		once: false
	};

	if (Object.isFunction(optsOrHandler)) {
		handler = optsOrHandler;

	} else {
		Object.assign(opts, optsOrHandler);
	}

	if (handler == null) {
		throw new ReferenceError('The watcher handler is not specified');
	}

	const watcher: Writable<Watcher> = {
		id: Math.random().toString().slice(2),
		target: el,
		handler,
		unwatch: () => unwatch(el, handler),
		...opts
	};

	if (!support.ResizeObserver) {
		return watcher;
	}

	let
		store = registeredWatchers.get(el);

	if (store == null) {
		store = new Map();
		registeredWatchers.set(el, store);
	}

	if (store.has(handler)) {
		unwatch(el, handler);
	}

	const observer = new ResizeObserver(([{contentRect}]) => {
		if (watcher.rect == null) {
			watcher.rect = contentRect;

			if (watcher.watchInit) {
				handler!(watcher.rect, undefined, watcher);
			}

			return;
		}

		const
			oldRect = watcher.rect;

		if (shouldInvokeHandler(contentRect, oldRect, watcher)) {
			watcher.rect = contentRect;

			const cb = () => {
				handler!(contentRect, oldRect, watcher);

				if (watcher.once) {
					watcher.unwatch();
				}
			};

			if (watcher.immediate) {
				cb();

			} else {
				asyncTasks.requestIdleCallback(cb, {
					timeout: 50,
					label: watcher.id,
					join: false
				});
			}
		}
	});

	watcher.observer = observer;
	observer.observe(el, Object.select(optsOrHandler, 'box'));
	store.set(handler, watcher);

	return watcher;
}

/**
 * Cancels watching for the specified element geometry.
 * If you pass a handler, then only it will be cancelled.
 *
 * @param el - the element to unobserve
 * @param [handler] - the registered handler
 *
 * @example
 * ```js
 * import * as ResizeWatcher from 'core/dom/resize-watcher';
 *
 * ResizeWatcher.watch(document.body, handler1);
 * ResizeWatcher.watch(document.body, handler2);
 *
 * // Cancel only `handler2` from `document.body`
 * ResizeWatcher.unwatch(document.body, handler2);
 *
 * // Cancel all handlers from `document.body`
 * ResizeWatcher.unwatch(document.body);
 * ```
 */
export function unwatch(el: Element, handler?: Nullable<WatchHandler>): void {
	const
		store = registeredWatchers.get(el);

	// eslint-disable-next-line eqeqeq
	if (store == null || handler === null) {
		return;
	}

	if (handler == null) {
		store.forEach((handle) => handle.unwatch());
		return;
	}

	const
		watcher = store.get(handler);

	if (watcher == null) {
		return;
	}

	watcher.observer?.disconnect();
	asyncTasks.clearAll({label: watcher.id});
	store.delete(handler);
}
