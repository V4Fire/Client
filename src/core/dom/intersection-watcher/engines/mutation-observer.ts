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
import { isElementInView, getElementPosition } from 'core/dom/intersection-watcher/engines/helpers';

import type { Watcher } from 'core/dom/intersection-watcher/interface';
import type { WatcherPosition } from 'core/dom/intersection-watcher/engines/interface';

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

			const checkViewport = $a.throttle(this.checkViewport.bind(this), 50, {
				label: $$.checkViewport
			});

			$a.on(document, 'scroll', checkViewport, {options: {capture: true}});
			$a.on(globalThis, 'resize', () => this.checkViewportFromScratch({join: false}));
		});
	}

	override destroy(): void {
		super.destroy();
		this.watchersYPositions = [];
		this.intersectionWindow = [];
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
		const {
			watchersXPositions,
			watchersYPositions,
			intersectionWindow
		} = this;

		const
			fromY = searchWatcher(true, watchersYPositions),
			toY = fromY != null ? searchWatcher(false, watchersYPositions) : null;

		const
			fromX = fromY != null ? searchWatcher(true, watchersXPositions) : null,
			toX = fromY != null ? searchWatcher(false, watchersXPositions) : null;

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
				this.onObservableOut(el.watcher);
			}
		}

		newIntersectionSet.forEach((el) => {
			this.onObservableIn(el.watcher);
		});

		this.intersectionWindow = newIntersectionWindow;

		function searchWatcher(
			start: boolean,
			where: WatcherPosition[],
			res?: number,
			from: number = 0,
			to: number = where.length - 1
		): CanUndef<number> {
			if (to < 0 || from >= where.length || where.length === 0) {
				return res;
			}

			if (where.length === 1) {
				return needToSaveCursor(0) ? 0 : res;
			}

			if (from >= to) {
				return needToSaveCursor(to) ? to : res;
			}

			const
				cursor = from + Math.floor((to - from) / 2),
				watcherPos = where[cursor];

			const
				r = watcherPos.watcher.root,
				isGlobalRoot = r === document.documentElement;

			if (needToSaveCursor(cursor)) {
				res = cursor;
			}

			if (where === watchersXPositions) {
				const
					left = innerWidth + r.scrollLeft + (isGlobalRoot ? 0 : scrollX);

				if (left < watcherPos.left) {
					return searchWatcher(start, where, res, 0, cursor - 1);
				}

			} else {
				const
					top = innerHeight + r.scrollTop + (isGlobalRoot ? 0 : scrollY);

				if (top < watcherPos.top) {
					return searchWatcher(start, where, res, 0, cursor - 1);
				}
			}

			return searchWatcher(start, where, res, cursor + 1, to);

			function needToSaveCursor(cursor: number): boolean {
				const
					{watcher} = where[cursor];

				if (!isElementInView(watcher.target, watcher.root, watcher.threshold)) {
					return false;
				}

				return res == null || (start ? res > cursor : res < cursor);
			}
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

				const pos = getElementPosition(watcher.target, watcher.root);
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
