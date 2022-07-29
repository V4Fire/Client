/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import { resolveAfterDOMLoaded } from 'core/event';
import type { AsyncOptions } from 'core/async';

import AbstractEngine from 'core/dom/intersection-watcher/engines/abstract';

import {

	getRootScrollRect,
	getElementScrollRect,

	isElementInView,
	getElementPosition

} from 'core/dom/intersection-watcher/engines/helpers';

import type { Watcher } from 'core/dom/intersection-watcher/interface';
import type { WatcherPosition, ObservableElements } from 'core/dom/intersection-watcher/engines/interface';

export const
	$$ = symbolGenerator();

export default class MutationObserverEngine extends AbstractEngine {
	/**
	 * A sorted array of static watchers positions
	 */
	protected watchersPositions: WatcherPosition[] = [];

	/**
	 * A sorted array of static watchers positions that are currently in the viewport
	 */
	protected intersectionWindow: WatcherPosition[] = [];

	/**
	 * A map of elements whose position needs to be checked dynamically using a frequent polling strategy
	 */
	protected dynamicalElements: ObservableElements = new Map();

	constructor() {
		super();

		const
			{async: $a} = this;

		void resolveAfterDOMLoaded().then(() => {
			const observer = new MutationObserver(() => {
				this.checkViewportFromScratch();
			});

			observer.observe(document.body, {
				subtree: true,
				childList: true,
				attributes: true,
				characterData: true
			});

			$a.worker(() => observer.disconnect());

			const checkViewport = () => $a.setTimeout(this.checkViewport.bind(this), 50, {
				label: $$.checkViewport,
				join: true
			});

			$a.on(document, 'scroll', checkViewport, {capture: true});
			$a.on(globalThis, 'resize', () => this.checkViewportFromScratch({join: false}));
		});
	}

	override destroy(): void {
		super.destroy();
		this.watchersPositions = [];
		this.intersectionWindow = [];
		this.dynamicalElements.clear();
	}

	protected override initWatcher(watcher: Writable<Watcher>): void {
		if (watcher.polling) {
			this.addWatcherToStore(watcher, this.dynamicalElements);
			this.removeWatcherFromStore(watcher, this.elements);

			this.async.setInterval(() => this.checkPollingElements(), 75, {
				label: $$.initWatcher,
				join: true
			});

		} else {
			this.checkViewportFromScratch();
		}

		const
			unwatch = watcher.unwatch.bind(watcher);

		watcher.unwatch = () => {
			unwatch();

			if (this.dynamicalElements.has(watcher.target)) {
				this.removeWatcherFromStore(watcher, this.dynamicalElements);

				if (this.dynamicalElements.size === 0) {
					this.async.clearInterval({label: $$.initWatcher});
				}

			} else {
				this.checkViewportFromScratch();
			}
		};
	}

	/**
	 * Rebuilds the watcher positions and checks the viewport to see if them have been appeared or disappeared.
	 * Keep in mind that this operation is quite expensive, so it is delayed by default.
	 *
	 * @param [immediate] - if true, then the check will be performed immediately
	 */
	protected checkViewportFromScratch(immediate?: boolean): void;

	/**
	 * Rebuilds the watcher positions and checks the viewport to see if them have been appeared or disappeared.
	 * Please note that the operation is performed with some delay to improve performance.
	 *
	 * @param opts - additional options for the deferred task
	 */
	protected checkViewportFromScratch(opts: AsyncOptions): void;

	protected checkViewportFromScratch(opts?: boolean | AsyncOptions): void {
		const run = () => {
			this.buildWatchersPositions();
			this.checkViewport();
		};

		if (opts === false) {
			run();
			return;
		}

		this.async.setTimeout(run, 100, {
			label: $$.recalculate,
			join: true,
			...Object.isDictionary(opts) ? opts : null
		});
	}

	/**
	 * Checks the viewport to see if watchers have been appeared or disappeared
	 */
	protected checkViewport(): void {
		const
			scrollRect = getRootScrollRect();

		const {
			watchersPositions,
			intersectionWindow
		} = this;

		const
			{scrollTop} = scrollRect;

		const
			from = searchWatcher(true),
			to = searchWatcher(false);

		if (from == null || to == null) {
			return;
		}

		const
			newIntersectionWindow = watchersPositions.slice(0, to + 1),
			newIntersectionSet = new Set(newIntersectionWindow);

		for (let i = 0; i < intersectionWindow.length; i++) {
			const
				el = intersectionWindow[i];

			if (newIntersectionSet.has(el)) {
				newIntersectionSet.delete(el);

			} else {
				this.onObservableOut(el.watcher);
			}
		}

		newIntersectionSet.forEach((el) => {
			this.onObservableIn(el.watcher);
		});

		this.intersectionWindow = newIntersectionWindow;

		function searchWatcher(
			start: boolean,
			res?: number,
			from: number = 0,
			to: number = watchersPositions.length
		): CanUndef<number> {
			if (from >= to) {
				return isWatcherInView(to) ? to : res;
			}

			const
				cursor = from + Math.floor((to - from) / 2);

			if (scrollTop > watchersPositions[cursor].top) {
				return searchWatcher(start, res, cursor + 1, to);
			}

			if (isWatcherInView(cursor)) {
				res = cursor;
			}

			return searchWatcher(start, res, 0, cursor);

			function isWatcherInView(cursor: number): boolean {
				const
					pos = watchersPositions[cursor],

					// Old versions of Chromium don't support `isConnected`
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					isConnected = pos.watcher.target.isConnected ?? true;

				if (!isConnected || !isElementInView(pos, scrollRect, pos.watcher.threshold)) {
					return false;
				}

				return res == null || (start ? res > cursor : res < cursor);
			}
		}
	}

	/**
	 * Checks "polled" watchers to see if they have appeared or disappeared
	 */
	protected checkPollingElements(): void {
		this.dynamicalElements.forEach((map) => {
			map.forEach((watcher) => {
				if (Object.isSet(watcher)) {
					return;
				}

				const
					root = (Object.isFunction(watcher.root) ? watcher.root() : watcher.root) ?? document.documentElement,
					watcherRect = watcher.target.getBoundingClientRect();

				const
					isWatcherInView = isElementInView(watcherRect, getElementScrollRect(root), watcher.threshold);

				this.setWatcherSize(watcher, watcherRect);

				if (isWatcherInView && !watcher.isLeaving) {
					this.onObservableIn(watcher);

				} else if (!isWatcherInView && watcher.isLeaving) {
					this.onObservableOut(watcher);
				}
			});
		});
	}

	/**
	 * Builds a sorted array of the watchers positions
	 */
	protected buildWatchersPositions(): void {
		this.watchersPositions = [];
		this.intersectionWindow = [];

		const
			positions = this.watchersPositions,
			scrollRect = getRootScrollRect();

		this.elements.forEach((watchers) => {
			watchers.forEach((watcher) => {
				if (Object.isSet(watcher)) {
					return;
				}

				const pos = getElementPosition(watcher.target, scrollRect);
				this.setWatcherSize(watcher, pos);

				if (pos.width === 0 || pos.height === 0) {
					this.async.clearAll({group: watcher.id});
					return;
				}

				positions.push({...pos, watcher});
			});
		});

		positions.sort((a, b) => a.top - b.top);
	}

	/**
	 * Handler: the observed element has entered the viewport
	 * @param watcher
	 */
	protected onObservableIn(watcher: Writable<Watcher>): void {
		const
			timestamp = performance.now();

		watcher.time = timestamp;
		watcher.timeIn = timestamp;

		watcher.isLeaving = false;
		this.callWatcherHandler(watcher);
		watcher.isLeaving = true;
	}

	/**
	 * Handler: the observed element has left the viewport
	 * @param watcher
	 */
	protected onObservableOut(watcher: Writable<Watcher>): void {
		const
			timestamp = performance.now();

		watcher.time = timestamp;
		watcher.timeOut = timestamp;

		watcher.onLeave?.(watcher);
		watcher.isLeaving = false;

		this.async.clearAll({group: watcher.id});
	}
}
