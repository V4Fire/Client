/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Pool from 'core/pool';

import AbstractEngine from 'core/dom/intersection-watcher/engines/abstract';
import type { Watcher } from 'core/dom/intersection-watcher/interface';

export default class IntersectionObserverEngine extends AbstractEngine {
	/**
	 * A map of IntersectionObserver instances
	 */
	protected observers: WeakMap<Watcher, IntersectionObserver> = new WeakMap();

	/**
	 * A map of IntersectionObserver pools
	 */
	protected observersPool: WeakMap<Element, Pool<IntersectionObserver>> = new WeakMap();

	protected override initWatcher(watcher: Watcher): void {
		const
			handler = this.onObserver.bind(this, watcher.threshold),
			unwatch = watcher.unwatch.bind(watcher);

		const
			root = Object.isFunction(watcher.root) ? watcher.root() : watcher.root,
			resolvedRoot = root ?? document.documentElement;

		const
			opts = Object.reject({...watcher, root}, 'delay');

		let
			observerPool = this.observersPool.get(resolvedRoot);

		if (observerPool == null) {
			observerPool = new Pool((handler, opts) => new IntersectionObserver(handler, opts), {
				hashFn: (_, opts) => Object.fastHash(opts)
			});

			this.observersPool.set(resolvedRoot, observerPool);
		}

		const observer = observerPool.borrowOrCreate(handler, opts);
		observer.value.observe(watcher.target);

		watcher.unwatch = () => {
			unwatch();
			observer.value.unobserve(watcher.target);
			observer.free();
		};

		this.observers.set(watcher, observer.value);
	}

	/**
	 * Handler: IntersectionObserver instance event
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
		for (let i = 0; i < entries.length; i++) {
			const
				entry = entries[i],
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
					this.onObservableOut(watcher, entry);

				} else if (entry.intersectionRatio >= watcher.threshold) {
					this.onObservableIn(watcher, entry);
				}
			});
		}
	}

	/**
	 * Handler: the observed element has entered the viewport
	 *
	 * @param watcher
	 * @param entry
	 */
	protected onObservableIn(watcher: Writable<Watcher>, entry: IntersectionObserverEntry): void {
		watcher.time = entry.time;
		watcher.timeIn = entry.time;
		watcher.isLeaving = false;

		watcher.onEnter?.(watcher);
		this.callWatcherHandler(watcher);

		watcher.isLeaving = true;
	}

	/**
	 * Handler: the observed element has left the viewport
	 *
	 * @param watcher
	 * @param entry
	 */
	protected onObservableOut(watcher: Writable<Watcher>, entry: IntersectionObserverEntry): void {
		watcher.time = entry.time;
		watcher.timeOut = entry.time;

		watcher.onLeave?.(watcher);
		watcher.isLeaving = false;

		this.async.clearAll({group: watcher.id});
	}
}
