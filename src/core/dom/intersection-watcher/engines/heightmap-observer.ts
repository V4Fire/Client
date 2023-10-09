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
import {

	InViewStatus,
	isElementInView,
	getElementPosition,
	resolveScrollTarget

} from 'core/dom/intersection-watcher/engines/helpers';

import type { Watcher } from 'core/dom/intersection-watcher/interface';
import type { WatcherPosition } from 'core/dom/intersection-watcher/engines/interface';

const
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
	 * A sorted array of watchers that are currently in the viewport
	 */
	protected intersectionWindow: Watcher[] = [];

	constructor() {
		super();

		const
			{async: $a} = this;

		void resolveAfterDOMLoaded().then(() => {
			if (typeof MutationObserver !== 'undefined') {
				const checkViewport = $a.throttle(this.checkViewportFromScratch.bind(this), 50, {
					label: $$.checkViewportFromScratch
				});

				const observer = new MutationObserver(() => {
					checkViewport();
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

			$a.on(document, 'scroll', (e: Event) => checkViewport(e.target), {options: {capture: true}});
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

		if (opts === true) {
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
			watcher.root = resolveScrollTarget(watcher.root());
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
		scrollTarget = resolveScrollTarget(scrollTarget);

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

		const noElementsInView =
			fromY == null ||
			toY == null ||
			fromX == null ||
			toX == null;

		// If none of the elements intersect the viewport / root view,
		// execute onLeave for the remaining elements of the intersectionWindow and clean up
		if (noElementsInView) {
			if (this.intersectionWindow.length > 0) {
				this.intersectionWindow.forEach((watcher) => {
					this.onObservableOut(watcher, scrollTarget);
				});

				this.intersectionWindow = [];
			}

			return;
		}

		const newIntersectionSet = new Set(seq(
			watchersYPositions.slice(fromY, toY + 1).map(({watcher}) => watcher),
			watchersXPositions.slice(fromX, toX + 1).map(({watcher}) => watcher)
		));

		const
			newIntersectionWindow = [...newIntersectionSet];

		intersectionWindow.forEach((watcher) => {
			if (newIntersectionSet.has(watcher)) {
				newIntersectionSet.delete(watcher);

			} else {
				this.onObservableOut(watcher, scrollTarget);
			}
		});

		newIntersectionSet.forEach((watcher) => {
			this.onObservableIn(watcher, scrollTarget);
		});

		this.intersectionWindow = newIntersectionWindow;

		function searchWatcher(
			left: boolean,
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

			if (inView === InViewStatus.true && left || inView === InViewStatus.left) {
				return searchWatcher(left, where, res, from, cursor);
			}

			return searchWatcher(left, where, res, cursor + 1, to);

			function needToSaveCursor(cursor: number): boolean {
				const
					watcher = where[cursor]?.watcher;

				if (isWatcherInView(watcher) !== InViewStatus.true) {
					return false;
				}

				return res == null || (left ? res > cursor : res < cursor);
			}
		}

		function isWatcherInView(watcher: CanUndef<Watcher>): ReturnType<typeof isElementInView> {
			if (watcher == null) {
				return InViewStatus.false;
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

		positions.sort((a, b) => {
			if (a.watcher.target === b.watcher.target) {
				return a.watcher.threshold - b.watcher.threshold;
			}

			return a.top - b.top;
		});

		this.watchersXPositions = positions.slice().sort((a, b) => {
			if (a.watcher.target === b.watcher.target) {
				return a.watcher.threshold - b.watcher.threshold;
			}

			return a.left - b.left;
		});
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
