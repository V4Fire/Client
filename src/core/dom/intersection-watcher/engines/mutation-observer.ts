/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import type { AsyncOptions } from 'core/async';

import { resolveAfterDOMLoaded } from 'core/event';

import type { Watcher } from 'core/dom/intersection-watcher/interface';
import type { WatcherPosition, ObservableElements } from 'core/dom/intersection-watcher/engines/interface';

import {

	getScrollRect,
	getElementRect

} from 'core/dom/intersection-watcher/engines/helpers';

import AbstractEngine from 'core/dom/intersection-watcher/engines/abstract';

export const
	$$ = symbolGenerator();

const
	CHECK_TIMEOUT = 50;

export default class MutationObserverEngine extends AbstractEngine {
	/**
	 * A map of elements that needs to be polled
	 */
	protected pollingElements: ObservableElements = new Map();

	/**
	 * A sorted array of watchers positions
	 */
	protected watchersPositions: WatcherPosition[] = [];

	protected intersectionWindow: WatcherPosition[] = [];

	/**
	 * Initializes an observer
	 */
	constructor() {
		super();

		const
			{async: $a} = this;

		const checkDeffer = () => $a.setTimeout(() => this.check(), CHECK_TIMEOUT, {
			label: $$.check,
			join: true
		});

		void resolveAfterDOMLoaded().then(() => {
			const observer = new MutationObserver(() => {
				this.reinit();
			});

			observer.observe(document.body, {
				subtree: true,
				childList: true,
				attributes: true,
				characterData: true
			});

			$a.setInterval(() => this.poll(), 75);

			$a.on(document, 'scroll', checkDeffer, true);
			$a.on(globalThis, 'resize', () => this.reinit({join: false}));
		});
	}

	/**
	 * Polls elements
	 */
	poll(): void {
		this.pollingElements.forEach((map) => {
			map.forEach((watcher) => {
				if (Object.isSet(watcher)) {
					return;
				}

				this.setWatcherSize(watcher, watcher.target.getBoundingClientRect());
			});
		});
	}

	protected override initWatcher(watcher: Watcher): void {
		if (watcher.polling) {
			this.addWatcherToStore(watcher, this.pollingElements);
			this.removeWatcherFromStore(watcher, this.elements);

		} else {
			this.recalculateDeffer();
		}

		const
			unwatch = watcher.unwatch.bind(watcher);

		watcher.unwatch = () => {
			unwatch();

			if (this.pollingElements.has(watcher.target)) {
				this.removeWatcherFromStore(watcher, this.pollingElements);

			} else {
				this.recalculateDeffer();
			}
		};
	}

	/**
	 * Re-initializes watching for elements
	 * @param [immediate] - if
	 */
	protected reinit(immediate?: boolean): void;

	/**
	 * Re-initializes watching for elements
	 */
	protected reinit(opts: AsyncOptions): void;

	protected reinit(opts?: boolean | AsyncOptions): void {
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
	 * Checks the viewport to see if elements have been appear or disappear
	 */
	protected checkViewport(): void {
		const
			rootRect = getScrollRect();

		const {
			watchersPositions,
			intersectionWindow
		} = this;

		const
			{scrollTop} = rootRect;

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
			index?: number,
			from: number = 0,
			to: number = watchersPositions.length
		): CanUndef<number> {
			if (from >= to) {
				return isMatches(to) ? to : index;
			}

			const
				pos = from + Math.floor((to - from) / 2);

			if (scrollTop > watchersPositions[pos].top) {
				return searchWatcher(start, index, pos + 1, to);
			}

			if (isMatches(pos)) {
				index = pos;
			}

			return searchWatcher(start, index, 0, pos);

			function isMatches(pos: number): boolean {
				const
					{watcher} = watchersPositions[pos];

				const
					// Old versions of Chromium don't support `isConnected`
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					isConnected = watcher.target.isConnected ?? true;

				if (!isConnected || !isInView(pos, rootRect, watcher.threshold)) {
					return false;
				}

				return index == null || (start ? index > pos : index < pos);
			}
		}
	}

	/**
	 * Builds a sorted array of the watchers positions
	 */
	protected buildWatchersPositions(): void {
		this.watchersPositions = [];
		this.intersectionWindow = [];

		const
			positions = this.watchersPositions,
			rootRect = getScrollRect();

		this.elements.forEach((watchers) => {
			watchers.forEach((watcher) => {
				if (Object.isSet(watcher)) {
					return;
				}

				const watcherRect = getElementRect(rootRect, watcher.target);
				this.setWatcherSize(watcher, watcherRect);

				if (watcherRect.width === 0 || watcherRect.height === 0) {
					this.async.clearAll({group: watcher.id});
					return;
				}

				positions.push({...watcherRect, watcher});
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

		if (Object.isFunction(watcher.onEnter)) {
			watcher.onEnter(watcher);
		}

		watcher.isLeaving = true;

		if (watcher.delay != null && watcher.delay > 0) {
			this.async.setTimeout(() => this.callWatcherHandler(watcher), watcher.delay, {
				group: watcher.id,
				label: $$.onObservableIn,
				join: true
			});

		} else {
			this.callWatcherHandler(watcher);
		}
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

		if (Object.isFunction(watcher.onLeave)) {
			watcher.onLeave(watcher);
		}

		watcher.isLeaving = false;
		this.async.clearAll({group: watcher.id});
	}
}
