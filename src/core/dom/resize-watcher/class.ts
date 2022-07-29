/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import Async from 'core/async';

import { shouldInvokeHandler } from 'core/dom/resize-watcher/helpers';
import type { Watcher, WatchOptions, WatchHandler, ObservableElements } from 'core/dom/resize-watcher/interface';

export const
	$$ = symbolGenerator();

export default class ResizeWatcher {
	/**
	 * An instance of ResizeObserver
	 */
	protected observer: ResizeObserver;

	/**
	 * A map of observable elements
	 */
	protected elements: ObservableElements = new Map();

	/** @see [[Async]] */
	protected async: Async<this> = new Async(this);

	constructor() {
		this.observer = new ResizeObserver((entries) => {
			entries.forEach(({target, contentRect}) => {
				this.elements.get(target)?.forEach((watcher) => {
					if (watcher.rect == null) {
						watcher.rect = contentRect;

						if (watcher.watchInit) {
							watcher.handler(watcher.rect, undefined, watcher);
						}

						return;
					}

					const
						oldRect = watcher.rect;

					if (shouldInvokeHandler(contentRect, oldRect, watcher)) {
						watcher.rect = contentRect;

						const cb = () => {
							watcher.handler(contentRect, oldRect, watcher);

							if (watcher.once) {
								watcher.unwatch();
							}
						};

						if (watcher.immediate) {
							cb();

						} else {
							this.async.requestIdleCallback(cb, {
								timeout: 50,
								group: watcher.id,
								label: $$.invokeHandler,
								join: false
							});
						}
					}
				});
			});
		});
	}

	/**
	 * Watches for the size of the given element and invokes the specified handler when it changes.
	 * The method returns a watcher object that can be used to cancel the watching.
	 *
	 * Note, changes occurring at the same tick are merged into one.
	 * You can disable this behavior by passing the `immediate: true` option.
	 *
	 * @param el - the element to watch
	 * @param handler - a function that will be called when the observable element is resized
	 *
	 * @example
	 * ```js
	 * import * as ResizeWatcher from 'core/dom/resize-watcher';
	 *
	 * const watcher = ResizeWatcher.watch(document.body, (newGeometry, oldGeometry, watcher) => {
	 *   console.log('The element has been resized', newGeometry, oldGeometry);
	 * });
	 *
	 * watcher.unwatch();
	 * ```
	 */
	watch(el: Element, handler: WatchHandler): Watcher;

	/**
	 * Watches for the size of the given element and invokes the specified handler when it changes.
	 * The method returns a watcher object that can be used to cancel the watching.
	 *
	 * Note, changes occurring at the same tick are merged into one.
	 * You can disable this behavior by passing the `immediate: true` option.
	 *
	 * @param el - the element to watch
	 * @param opts - additional watch options
	 * @param handler - a function that will be called when the observable element is resized
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
	watch(el: Element, opts: WatchOptions, handler: WatchHandler): Watcher;

	watch(
		el: Element,
		optsOrHandler?: WatchHandler | WatchOptions,
		handler?: WatchHandler
	): Watcher {
		if (this.async.locked) {
			throw new Error("It isn't possible to add an element to watch because the watcher instance is destroyed");
		}

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

			unwatch() {
				return undefined;
			},

			...opts
		};

		let
			store = this.elements.get(el);

		if (store == null) {
			store = new Map();
			this.elements.set(el, store);
		}

		if (store.has(handler)) {
			this.unwatch(el, handler);
		}

		watcher.unwatch = () => {
			if (handler != null) {
				store?.delete(handler);
			}

			this.observer.unobserve(watcher.target);
			this.async.clearAll({group: watcher.id});
		};

		this.observer.observe(el, Object.select(optsOrHandler, 'box'));
		store.set(handler, watcher);

		return watcher;
	}

	/**
	 * Cancels watching for the registered elements.
	 *
	 * If the method takes an element, then only that element will be unwatched.
	 * Additionally, you can filter the watchers to be canceled by specifying a handler.
	 *
	 * @param [el] - the element to unwatch
	 * @param [handler] - the handler to filter
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
	 * // Cancel the all registered handlers from `document.body`
	 * ResizeWatcher.unwatch(document.body);
	 *
	 * // Cancel the all registered handlers
	 * ResizeWatcher.unwatch();
	 * ```
	 */
	unwatch(el?: Element, handler?: Nullable<WatchHandler>): void {
		if (el == null) {
			this.elements.forEach((watchers) => {
				watchers.forEach((watcher) => {
					this.unwatch(watcher.target);
				});
			});

			return;
		}

		const
			store = this.elements.get(el);

		if (handler == null) {
			store?.forEach((watcher) => watcher.unwatch());
			return;
		}

		store?.get(handler)?.unwatch();
	}

	/**
	 * Cancels watching for the all registered elements and destroys the instance
	 *
	 * @example
	 * ```js
	 * import * as ResizeWatcher from 'core/dom/resize-watcher';
	 *
	 * // Cancel the all registered handlers and prevent new ones
	 * ResizeWatcher.destroy();
	 * ```
	 */
	destroy(): void {
		this.elements.clear();
		this.observer.disconnect();
		this.async.clearAll().locked = true;
	}
}
