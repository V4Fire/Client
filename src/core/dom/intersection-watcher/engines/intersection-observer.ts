/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Pool from 'core/pool';

import AbstractEngine from 'core/dom/intersection-watcher/engines/abstract';
import { isElementInView } from 'core/dom/intersection-watcher/engines/helpers';

import type { Watcher } from 'core/dom/intersection-watcher/interface';

export default class IntersectionObserverEngine extends AbstractEngine {
	/**
	 * A map of IntersectionObserver instances
	 */
	protected observers: Map<Watcher, IntersectionObserver> = new Map();

	/**
	 * A map of IntersectionObserver pools
	 */
	protected observersPool: Map<Element, Pool<IntersectionObserver>> = new Map();

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
			root = Object.isFunction(watcher.root) ? watcher.root() : watcher.root,
			resolvedRoot = root ?? document.documentElement;

		const opts = {
			root,
			trackVisibility: watcher.trackVisibility,
			threshold: watcher.threshold,
			delay: 0
		};

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

		const observer = observerPool.borrowOrCreate(handler, opts);
		observer.value.observe(watcher.target);

		watcher.unwatch = () => {
			unwatch();
			this.observers.delete(watcher);

			if (this.elements.has(watcher.target)) {
				observer.value.unobserve(watcher.target);
				observer.free();

			} else {
				this.observersPool.delete(watcher.target);
				observer.value.disconnect();
				observer.destroy();
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
					this.onObservableOut(watcher, entry);

				} else if (
					watcher.root != null ?
						isElementInView(watcher.target, watcher.root, watcher.threshold) > 0 :
						entry.intersectionRatio >= watcher.threshold
				) {
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
	protected onObservableIn(watcher: Writable<Watcher>, entry: IntersectionObserverEntry): void {
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
	protected onObservableOut(watcher: Writable<Watcher>, entry: IntersectionObserverEntry): void {
		watcher.time = entry.time;
		watcher.timeOut = entry.time;

		watcher.onLeave?.(watcher);
		watcher.isLeaving = false;

		this.async.clearAll({group: watcher.id});
	}
}
