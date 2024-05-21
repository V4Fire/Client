/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Pool from 'core/pool';

import AbstractEngine from 'core/dom/intersection-watcher/engines/abstract';
import { isElementInView, resolveScrollTarget } from 'core/dom/intersection-watcher/engines/helpers';

import type { Watcher } from 'core/dom/intersection-watcher/interface';

import type { PartialIOEntry } from 'core/dom/intersection-watcher/engines/interface';

export default class IntersectionObserverEngine extends AbstractEngine {
	/**
	 * A map of IntersectionObserver instances
	 */
	protected observers: Map<Watcher, IntersectionObserver> = new Map();

	/**
	 * A map of IntersectionObserver pools
	 */
	protected observersPool: Map<Element, Pool<IntersectionObserver>> = new Map();

	/**
	 * A map of currently intersecting elements
	 */
	protected intersectingTargets: Map<IntersectionObserver, Set<Element>> = new Map();

	override destroy(): void {
		this.observers.forEach((observer) => {
			observer.disconnect();
		});

		this.elements.clear();
		this.observers.clear();
		this.observersPool.clear();

		super.destroy();
	}

	protected override initWatcher(watcher: Writable<Watcher>): void {
		const
			handler = this.onObserver.bind(this, watcher.threshold),
			unwatch = watcher.unwatch.bind(watcher);

		const
			root = resolveScrollTarget(Object.isFunction(watcher.root) ? watcher.root() : watcher.root),
			resolvedRoot = root ?? document.documentElement;

		const opts = {
			root,
			trackVisibility: watcher.trackVisibility,
			threshold: watcher.threshold,
			delay: 0
		};

		watcher.root = opts.root;

		if (opts.trackVisibility) {
			opts.delay = 100;
			watcher.delay += 100;
		}

		let
			observerPool = this.observersPool.get(resolvedRoot);

		if (observerPool == null) {
			observerPool = new Pool((handler, opts) => new IntersectionObserver(handler, opts), {
				hashFn: (_, opts) => Object.fastHash(Object.reject(opts, 'root'))
			});

			this.observersPool.set(resolvedRoot, observerPool);
		}

		const
			observer = observerPool.borrowOrCreate(handler, opts);

		const
			targets = this.intersectingTargets.get(observer.value);

		if (targets?.has(watcher.target)) {
			this.onObservableIn(watcher, {
				time: performance.now()
			});

		} else {
			observer.value.observe(watcher.target);
		}

		watcher.unwatch = () => {
			unwatch();
			this.observers.delete(watcher);
			this.removeIntersectingTarget(observer.value, watcher.target);

			let
				observerHasWatchers = false,
				elementHasWatchers = false;

			for (const [watcherItem, observerItem] of this.observers) {
				if (observerItem === observer.value) {
					observerHasWatchers = true;
				}

				if (watcherItem.target === watcher.target) {
					elementHasWatchers = true;
				}
			}

			if (!observerHasWatchers) {
				observer.value.disconnect();
				observer.destroy();

				if (observerPool?.size === 0) {
					this.observersPool.delete(resolvedRoot);
				}

			} else if (!elementHasWatchers) {
				observer.value.unobserve(watcher.target);
				observer.free();
			}
		};

		this.observers.set(watcher, observer.value);
	}

	/**
	 * Handler: the IntersectionObserver instance event
	 *
	 * @param threshold
	 * @param entries
	 * @param observer
	 */
	protected onObserver(
		threshold: number,
		entries: IntersectionObserverEntry[],
		observer: IntersectionObserver
	): void {
		entries.forEach((entry) => {
			const
				watchers = this.elements.get(entry.target)?.get(threshold);

			if (!Object.isSet(watchers)) {
				return;
			}

			watchers.forEach((watcher) => {

				if (this.observers.get(watcher) !== observer) {
					return;
				}

				this.setWatcherSize(watcher, entry.boundingClientRect);

				if (watcher.isLeaving) {
					this.removeIntersectingTarget(observer, watcher.target);
					this.onObservableOut(watcher, entry);

				} else if (
					watcher.root != null ?
						isElementInView(watcher.target, watcher.root, watcher.threshold) > 0 :
						entry.intersectionRatio >= watcher.threshold
				) {
					this.addIntersectingTarget(observer, watcher.target);
					this.onObservableIn(watcher, entry);
				}
			});
		});
	}

	/**
	 * Handler: the observed element has entered the viewport
	 *
	 * @param watcher
	 * @param entry
	 */
	protected onObservableIn(watcher: Writable<Watcher>, entry: PartialIOEntry): void {
		watcher.time = entry.time;
		watcher.timeIn = entry.time;

		watcher.isLeaving = false;
		this.callWatcherHandler(watcher);
		watcher.isLeaving = true;
	}

	/**
	 * Handler: the observed element has left the viewport
	 *
	 * @param watcher
	 * @param entry
	 */
	protected onObservableOut(watcher: Writable<Watcher>, entry: PartialIOEntry): void {
		watcher.time = entry.time;
		watcher.timeOut = entry.time;

		watcher.onLeave?.(watcher);
		watcher.isLeaving = false;

		this.async.clearAll({group: watcher.id});
	}

	/**
	 * Stores the intersecting target of the specified intersection observer instance
	 *
	 * @param observer
	 * @param target
	 */
	protected addIntersectingTarget(observer: IntersectionObserver, target: Element): void {
		let
			targets = this.intersectingTargets.get(observer);

		if (!Object.isSet(targets)) {
			targets = new Set();
			this.intersectingTargets.set(observer, targets);
		}

		targets.add(target);
	}

	/**
	 * Removes the stored intersecting target for the specified intersection observer instance
	 *
	 * @param observer
	 * @param target
	 */
	protected removeIntersectingTarget(observer: IntersectionObserver, target: Element): void {
		const
			targets = this.intersectingTargets.get(observer);

		if (Object.isSet(targets)) {
			targets.delete(target);

			if (targets.size === 0) {
				this.intersectingTargets.delete(observer);
			}
		}
	}
}
