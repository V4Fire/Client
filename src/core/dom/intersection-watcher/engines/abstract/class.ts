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
	WatchHandler,

	ObservableElements,
	ObservableGroups

} from 'core/dom/intersection-watcher/interface';

export default abstract class IntersectionWatcher {
	/**
	 * A map of observable elements
	 */
	protected readonly elements: ObservableElements = new Map();

	/**
	 * A map of suspended observable elements
	 */
	protected readonly suspendedElements: ObservableElements = new Map();

	/**
	 * A map of grouped observable elements
	 */
	protected readonly elementsByGroup: ObservableGroups = Object.createDict();

	/** @see [[Async]] */
	protected readonly async: Async<this> = new Async(this);

	/**
	 * Watches for the intersection of the passed element and the viewport.
	 * Calls the specified handler each time the element enters the viewport.
	 *
	 * @param el - the element to observe
	 * @param handler - the function that will be called when the element enters the viewport
	 */
	watch(el: Element, handler: WatchHandler): Watcher;

	/**
	 * Watches for the intersection of the passed element and the viewport.
	 * Calls the specified handler each time the element enters the viewport.
	 *
	 * @param el - the element to observe
	 * @param opts - additional observation options
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

		let
			watcher = this.getWatcher(el, opts.threshold);

		if (watcher != null) {
			return watcher;
		}

		watcher = {
			id: Math.random().toString().slice(2),
			target: el,
			isLeaving: false,

			size: {
				width: 0,
				height: 0
			},

			unwatch: () => this.unwatch(el, handler),
			...opts
		};

		if (watcher.group != null) {
			const
				{elementsByGroup} = this;

			let
				group = elementsByGroup[watcher.group];

			if (group == null) {
				group = new Map();
				elementsByGroup[watcher.group] = group;
			}

			let
				watchers = group.get(el);

			if (watchers == null) {
				watchers = new Map();
				group.set(el, watchers);
			}

			watchers.set(handler!, watcher);
			watchers.set(watcher.threshold, watcher);
		}

		this.initWatcher(watcher);
		return watcher;
	}

	protected abstract initWatcher(watcher: Watcher): void;

	/**
	 * Returns a watcher object of the passed element by the specified threshold or handler
	 *
	 * @param el
	 * @param thresholdOrHandler
	 */
	protected getWatcher(el: Element, thresholdOrHandler: number | WatchHandler): CanUndef<Writable<Watcher>> {
		return this.elements.get(el)?.get(thresholdOrHandler);
	}
}
