/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';

import type {

	Watcher,
	WatchOptions,

	WatchLink,
	WatchHandler,

	ElementSize,
	ObservableElements

} from 'core/dom/intersection-watcher/interface';

export default abstract class AbstractEngine {
	/**
	 * A map of observable elements
	 */
	protected readonly elements: ObservableElements = new Map();

	/** @see [[Async]] */
	protected readonly async: Async<this> = new Async(this);

	/**
	 * Watches for the intersection of the passed element and the viewport.
	 * Calls the specified handler each time the element enters the viewport.
	 *
	 * @param el - the element to watch
	 * @param handler - the function that will be called when the element enters the viewport
	 */
	watch(el: Element, handler: WatchHandler): Watcher;

	/**
	 * Watches for the intersection of the passed element and the viewport.
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
					this.removeWatcherFromStore(watcher);
					this.async.clearAll({label: watcher.id});
				}
			},

			...opts
		};

		this.initWatcher(watcher);
		this.addWatcherToStore(watcher);

		return watcher;
	}

	/**
	 * Initializes the specified watcher
	 * @param watcher
	 */
	protected abstract initWatcher(watcher: Watcher): void;

	/**
	 * Cancels watching for viewport intersection for the passed element or group.
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

		watcher.handler(watcher);

		if (watcher.once) {
			watcher.unwatch();
		}
	}

	/**
	 * Adds the specified watcher to the store
	 * @param watcher
	 */
	protected addWatcherToStore(watcher: Watcher): void {
		let
			store = this.elements.get(watcher.target);

		if (store == null) {
			store = new Map();
			this.elements.set(watcher.target, store);
		}

		store.set(watcher.handler, watcher);

		const
			thresholdGroup = store.get(watcher.threshold);

		if (Object.isSet(thresholdGroup)) {
			thresholdGroup.add(watcher);

		} else {
			store.set(watcher.threshold, new Set([watcher]));
		}
	}

	/**
	 * Removes the specified watcher from the store
	 * @param watcher
	 */
	protected removeWatcherFromStore(watcher: Watcher): void {
		const
			store = this.elements.get(watcher.target);

		if (store == null) {
			return;
		}

		store.delete(watcher.handler);

		const
			thresholdGroup = store.get(watcher.threshold);

		if (Object.isSet(thresholdGroup)) {
			thresholdGroup.delete(watcher);

		} else {
			store.delete(watcher.threshold);
		}
	}
}
