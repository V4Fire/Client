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

export const
	$$ = symbolGenerator();

export default abstract class AbstractEngine {
	/**
	 * A map of observable elements
	 */
	protected elements: ObservableElements = new Map();

	/** @see [[Async]] */
	protected async: Async<this> = new Async(this);

	/**
	 * Watches for the intersection of the passed element with the viewport.
	 * Calls the specified handler each time the element enters the viewport.
	 *
	 * @param el - the element to watch
	 * @param handler - the function that will be called when the element enters the viewport
	 */
	watch(el: Element, handler: WatchHandler): Watcher;

	/**
	 * Watches for the intersection of the passed element with the viewport.
	 * Calls the specified handler each time the element enters the viewport.
	 *
	 * @param el - the element to watch
	 * @param opts - additional watch options
	 * @param handler - the function that will be called when the element enters the viewport
	 */
	watch(el: Element, opts: WatchOptions, handler: WatchHandler): Watcher;

	watch(
		el: Element,
		optsOrHandler?: WatchHandler | WatchOptions,
		handler?: WatchHandler
	): Watcher {
		const opts = {
			once: false,
			threshold: 1
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
			id: Math.random().toString().slice(2),
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
	 * Initializes the specified watcher
	 * @param watcher
	 */
	protected abstract initWatcher(watcher: Watcher): void;

	/**
	 * Cancels watching for viewport intersection of the passed element or group.
	 * In addition, you can filter the watchers that will be canceled by specifying a handler or threshold value.
	 *
	 * @param target - the element or group to iterate
	 * @param [filter] - the handler or threshold to filter
	 */
	unwatch(target: Element, filter?: WatchLink): void {
		const
			watchers = this.elements.get(target);

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
	 * Sets a new size for the specified watcher
	 *
	 * @param size
	 * @param watcher
	 */
	protected setWatcherSize(watcher: Watcher, size: ElementSize): void {
		watcher.size.width = size.width;
		watcher.size.height = size.height;
	}

	/**
	 * Calls a handler of the specified watcher
	 * @param watcher
	 */
	protected callWatcherHandler(watcher: Watcher): void {
		if (watcher.shouldHandle != null && !Object.isTruly(watcher.shouldHandle(watcher))) {
			return;
		}

		if (watcher.delay != null && watcher.delay > 0) {
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

		} else {
			s.delete(watcher.threshold);
		}
	}
}
