/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import Async from 'core/async';

import type {

	Watcher,
	WatchOptions,

	WatchLink,
	WatchHandler,

	ElementSize

} from 'core/dom/intersection-watcher/interface';

import type { ObservableElements } from 'core/dom/intersection-watcher/engines/interface';

const
	$$ = symbolGenerator();

export default abstract class AbstractEngine {
	/**
	 * A map of observable elements
	 */
	protected elements: ObservableElements = new Map();

	/** {@link Async} */
	protected async: Async = new Async();

	/**
	 * Tracks the intersection of the passed element with the viewport,
	 * and invokes the specified handler each time the element enters the viewport.
	 * The method returns a watcher object that can be used to cancel the watching.
	 *
	 * @param el - the element to watch
	 * @param handler - a function that will be called when the element enters the viewport
	 *
	 * @example
	 * ```js
	 * import * as IntersectionWatcher from 'core/dom/intersection-watcher';
	 *
	 * IntersectionWatcher.watch(document.getElementById('my-elem'), (watcher) => {
	 *   console.log('The element has entered the viewport', watcher.target);
	 * });
	 * ```
	 */
	watch(el: Element, handler: WatchHandler): Watcher;

	/**
	 * Tracks the intersection of the passed element with the viewport,
	 * and invokes the specified handler each time the element enters the viewport.
	 * The method returns a watcher object that can be used to cancel the watching.
	 *
	 * @param el - the element to watch
	 * @param opts - additional watch options
	 * @param handler - a function that will be called when the element enters the viewport
	 *
	 * @example
	 * ```js
	 * import * as IntersectionWatcher from 'core/dom/intersection-watcher';
	 *
	 * IntersectionWatcher.watch(document.getElementById('my-elem'), {threshold: 0.5}, (watcher) => {
	 *   console.log('The element has entered the viewport', watcher.target);
	 * });
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
			once: false,
			threshold: 1,
			delay: 0,
			onlyRoot: true
		};

		if (Object.isFunction(optsOrHandler)) {
			handler = optsOrHandler;

		} else {
			Object.assign(opts, optsOrHandler);
		}

		if (handler == null) {
			throw new ReferenceError('The watcher handler is not specified');
		}

		let
			watcher = this.elements.get(el)?.get(handler);

		if (watcher != null) {
			return Object.cast(watcher);
		}

		watcher = {
			id: Object.fastHash(Math.random()),
			target: el,

			handler,
			isLeaving: false,

			size: {
				width: 0,
				height: 0
			},

			unwatch: () => {
				if (Object.isPlainObject(watcher)) {
					this.removeWatcherFromStore(watcher, this.elements);
					this.async.clearAll({group: watcher.id});
				}
			},

			...opts
		};

		this.initWatcher(watcher);
		this.addWatcherToStore(watcher, this.elements);

		return watcher;
	}

	/**
	 * Cancels watching for the registered elements.
	 *
	 * If the method takes an element, then only that element will be unwatched.
	 * Additionally, you can filter the watchers to be canceled by specifying a handler or a threshold.
	 *
	 * @param [el] - the element to unwatch
	 * @param [filter] - the handler or threshold to filter
	 *
	 * @example
	 * ```js
	 * import * as IntersectionWatcher from 'core/dom/intersection-watcher';
	 *
	 * IntersectionWatcher.watch(document.getElementById('my-elem'), handler1);
	 * IntersectionWatcher.watch(document.getElementById('my-elem'), {threshold: 0.5}, handler2);
	 * IntersectionWatcher.watch(document.getElementById('my-elem'), {threshold: 0.5}, handler3);
	 *
	 * // Cancel only `handler1` from the passed element
	 * IntersectionWatcher.unwatch(document.getElementById('my-elem'), handler1);
	 *
	 * // Cancel the all registered handlers with the `threshold = 0.5` from the passed element
	 * IntersectionWatcher.unwatch(document.getElementById('my-elem'), 0.5);
	 *
	 * // Cancel the all registered handlers from the passed element
	 * IntersectionWatcher.unwatch(document.getElementById('my-elem'));
	 *
	 * // Cancel the all registered handlers
	 * IntersectionWatcher.unwatch();
	 * ```
	 */
	unwatch(el?: Element, filter?: WatchLink): void {
		if (el == null) {
			this.elements.forEach((watchers) => {
				watchers.forEach((watcher) => {
					if (Object.isSet(watcher)) {
						return;
					}

					this.unwatch(watcher.target);
				});
			});

			return;
		}

		const
			watchers = this.elements.get(el);

		if (filter == null) {
			watchers?.forEach((watcher) => {
				if (!Object.isSet(watcher)) {
					watcher.unwatch();
				}
			});

			return;
		}

		const
			watcher = watchers?.get(filter);

		if (Object.isSet(watcher)) {
			watcher.forEach((watcher) => watcher.unwatch());
			return;
		}

		watcher?.unwatch();
	}

	/**
	 * Cancels watching for all registered elements and destroys the instance
	 */
	destroy(): void {
		this.unwatch();
		this.elements.clear();
		this.async.clearAll().locked = true;
	}

	/**
	 * Initializes the specified watcher
	 * @param watcher
	 */
	protected abstract initWatcher(watcher: Writable<Watcher>): void;

	/**
	 * Sets a new size for the specified watcher
	 *
	 * @param watcher
	 * @param size
	 */
	protected setWatcherSize(watcher: Writable<Watcher>, size: ElementSize): void {
		watcher.size.width = size.width;
		watcher.size.height = size.height;
	}

	/**
	 * Calls a handler of the specified watcher
	 * @param watcher
	 */
	protected callWatcherHandler(watcher: Watcher): void {
		if (watcher.onEnter != null && !Object.isTruly(watcher.onEnter(watcher))) {
			return;
		}

		if (watcher.delay > 0) {
			this.async.setTimeout(call, watcher.delay, {
				group: watcher.id,
				label: $$.callWatcherHandler,
				join: true
			});

		} else {
			call();
		}

		function call() {
			watcher.handler(watcher);

			if (watcher.once) {
				watcher.unwatch();
			}
		}
	}

	/**
	 * Adds the specified watcher to the store
	 *
	 * @param watcher
	 * @param store
	 */
	protected addWatcherToStore(watcher: Watcher, store: ObservableElements): void {
		let
			s = store.get(watcher.target);

		if (s == null) {
			s = new Map();
			store.set(watcher.target, s);
		}

		s.set(watcher.handler, watcher);

		const
			thresholdGroup = s.get(watcher.threshold);

		if (Object.isSet(thresholdGroup)) {
			thresholdGroup.add(watcher);

		} else {
			s.set(watcher.threshold, new Set([watcher]));
		}
	}

	/**
	 * Removes the specified watcher from the store
	 *
	 * @param watcher
	 * @param store
	 */
	protected removeWatcherFromStore(watcher: Watcher, store: ObservableElements): void {
		const
			s = store.get(watcher.target);

		if (s == null) {
			return;
		}

		s.delete(watcher.handler);

		const
			thresholdGroup = s.get(watcher.threshold);

		if (Object.isSet(thresholdGroup)) {
			thresholdGroup.delete(watcher);

			if (thresholdGroup.size === 0) {
				s.delete(watcher.threshold);
			}

		} else {
			s.delete(watcher.threshold);
		}

		if (s.size === 0) {
			store.delete(watcher.target);
		}
	}
}
