/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import { seq } from 'core/iter/combinators';

import { resolveAfterDOMLoaded } from 'core/event';
import type { AsyncOptions } from 'core/async';

import AbstractEngine from 'core/dom/intersection-watcher/engines/abstract';
import { getElementPosition, isElementInView } from 'core/dom/intersection-watcher/engines/helpers';

import type { Watcher } from 'core/dom/intersection-watcher/interface';
import { SearchDirection, WatcherPosition } from 'core/dom/intersection-watcher/engines/interface';

export const
	$$ = symbolGenerator();

export default class MutationObserverEngine extends AbstractEngine {
	/**
	 * An Y-sorted array of static watchers positions
	 */
	protected watchersYPositions: WatcherPosition[] = [];

	/**
	 * An X-sorted array of static watchers positions
	 */
	protected watchersXPositions: WatcherPosition[] = [];

	/**
	 * A sorted array of static watchers positions that are currently in the viewport
	 */
	protected intersectionWindow: WatcherPosition[] = [];

	constructor() {
		super();

		const
			{async: $a} = this;

		void resolveAfterDOMLoaded().then(() => {
			if (typeof MutationObserver !== 'undefined') {
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

			} else {
				this.checkViewportFromScratch();
			}

			const checkViewport = $a.throttle(this.checkViewport.bind(this), 50, {
				label: $$.checkViewport
			});

			$a.on(document, 'scroll', (e) => checkViewport(e.target), {options: {capture: true}});
			$a.on(globalThis, 'resize', () => this.checkViewportFromScratch({join: false}));
		});
	}

	override destroy(): void {
		super.destroy();
		this.watchersYPositions = [];
		this.intersectionWindow = [];
	}

	/**
	 * Rebuilds the watcher positions and checks the viewport to see if them have been appeared or disappeared.
	 * Keep in mind that this operation is quite expensive, so it is delayed by default.
	 *
	 * @param [immediate] - if true, then the check will be performed immediately
	 */
	checkViewportFromScratch(immediate?: boolean): void;

	/**
	 * Rebuilds the watcher positions and checks the viewport to see if them have been appeared or disappeared.
	 * Please note that the operation is performed with some delay to improve performance.
	 *
	 * @param opts - additional options for the deferred task
	 */
	checkViewportFromScratch(opts: AsyncOptions): void;

	checkViewportFromScratch(opts?: boolean | AsyncOptions): void {
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

	protected override initWatcher(watcher: Writable<Watcher>): void {
		if (Object.isFunction(watcher.root)) {
			watcher.root = watcher.root();
		}

		watcher.root ??= document.scrollingElement ?? document.documentElement;
		this.checkViewportFromScratch();

		const
			unwatch = watcher.unwatch.bind(watcher);

		watcher.unwatch = () => {
			unwatch();
			this.checkViewportFromScratch();
		};
	}

	/**
	 * Checks the viewport to see if watchers have been appeared or disappeared
	 * @param [scrollTarget] - the element on which the scroll change event occurred
	 */
	protected checkViewport(scrollTarget?: Element): void {
		const {
			watchersXPositions,
			watchersYPositions,
			intersectionWindow
		} = this;

		const
			inViewCache = new Map<Watcher, ReturnType<typeof isElementInView>>();

		const
			fromY = searchWatcher(true, watchersYPositions),
			toY = fromY != null ? searchWatcher(false, watchersYPositions) : null;

		const
			fromX = fromY != null ? searchWatcher(true, watchersXPositions) : null,
			toX = fromX != null && fromY != null ? searchWatcher(false, watchersXPositions) : null;

		if (fromY == null || toY == null || fromX == null || toX == null) {
			if (this.intersectionWindow.length > 0) {
				this.intersectionWindow = [];
			}

			return;
		}

		const newIntersectionSet = new Set(seq(
			watchersYPositions.slice(fromY, toY + 1),
			watchersXPositions.slice(fromX, toX + 1)
		));

		const
			newIntersectionWindow = [...newIntersectionSet];

		for (let i = 0; i < intersectionWindow.length; i++) {
			const
				el = intersectionWindow[i];

			if (newIntersectionSet.has(el)) {
				newIntersectionSet.delete(el);

			} else {
				this.onObservableOut(el.watcher, scrollTarget);
			}
		}

		newIntersectionSet.forEach((el) => {
			this.onObservableIn(el.watcher, scrollTarget);
		});

		this.intersectionWindow = newIntersectionWindow;

		function searchWatcher(
			start: boolean,
			where: WatcherPosition[],
			res?: number,
			from: number = 0,
			to: number = where.length - 1
		): CanUndef<number> {
			if (where.length <= 1) {
				return needToSaveCursor(0) ? 0 : res;
			}

			if (from >= to) {
				return needToSaveCursor(to) ? to : res;
			}

			const
				cursor = Math.floor((to + from) / 2),
				el = where[cursor];

			if (needToSaveCursor(cursor)) {
				res = cursor;
			}

			const
				inView = isWatcherInView(el.watcher);

			if (inView === true && start || inView === SearchDirection.left) {
				return searchWatcher(start, where, res, from, cursor);
			}

			return searchWatcher(start, where, res, cursor + 1, to);

			function needToSaveCursor(cursor: number): boolean {
				const
					watcher = where[cursor]?.watcher;

				if (isWatcherInView(watcher) !== true) {
					return false;
				}

				return res == null || (start ? res > cursor : res < cursor);
			}
		}

		function isWatcherInView(watcher: CanUndef<Watcher>): ReturnType<typeof isElementInView> {
			if (watcher == null) {
				return false;
			}

			if (inViewCache.has(watcher)) {
				return inViewCache.get(watcher)!;
			}

			const res = isElementInView(watcher.target, watcher.root!, watcher.threshold);
			inViewCache.set(watcher, res);
			return res;
		}
	}

	/**
	 * Builds a sorted array of the watchers positions
	 */
	protected buildWatchersPositions(): void {
		this.watchersYPositions = [];
		this.intersectionWindow = [];

		const
			positions = this.watchersYPositions;

		this.elements.forEach((watchers) => {
			watchers.forEach((watcher) => {
				if (Object.isSet(watcher)) {
					return;
				}

				const pos = getElementPosition(watcher.target, watcher.root!);
				this.setWatcherSize(watcher, pos);

				if (pos.width === 0 || pos.height === 0) {
					this.async.clearAll({group: watcher.id});
					return;
				}

				positions.push({...pos, watcher});
			});
		});

		positions.sort((a, b) => a.top - b.top);
		this.watchersXPositions = positions.slice().sort((a, b) => a.left - b.left);
	}

	/**
	 * Handler: the observed element has entered the viewport
	 *
	 * @param watcher
	 * @param [scrollTarget] - the element on which the scroll change event occurred
	 */
	protected onObservableIn(watcher: Writable<Watcher>, scrollTarget?: Element): void {
		const
			timestamp = performance.now();

		watcher.time = timestamp;
		watcher.timeIn = timestamp;
		watcher.isLeaving = false;

		if (scrollTarget == null || watcher.onlyRoot === false || watcher.root === scrollTarget) {
			this.callWatcherHandler(watcher);
		}

		watcher.isLeaving = true;
	}

	/**
	 * Handler: the observed element has left the viewport
	 *
	 * @param watcher
	 * @param [scrollTarget] - the element on which the scroll change event occurred
	 */
	protected onObservableOut(watcher: Writable<Watcher>, scrollTarget?: Element): void {
		const
			timestamp = performance.now();

		watcher.time = timestamp;
		watcher.timeOut = timestamp;

		if (scrollTarget == null || watcher.onlyRoot === false || watcher.root === scrollTarget) {
			watcher.onLeave?.(watcher);
		}

		watcher.isLeaving = false;
		this.async.clearAll({group: watcher.id});
	}
}
