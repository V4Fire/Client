/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import { ObservableElement, IntersectionObserverOptions } from 'core/component/directives/in-view/interface';
import { hasIntersection } from 'core/component/directives/in-view/intersection/helpers';

import Super from 'core/component/directives/in-view/super';

export type AdapteeType =
	'observer';

export const
	$$ = symbolGenerator();

export default class InView extends Super {
	/**
	 * True if the current adaptee can be used
	 */
	static readonly acceptable: boolean = hasIntersection;

	/**
	 * Adaptee type
	 */
	readonly type: AdapteeType = 'observer';

	/**
	 * Contains IntersectionObserver instances
	 */
	protected readonly observers: Dictionary<IntersectionObserver> = {};

	/**
	 * Contains a id for root elements
	 */
	protected readonly rootMap: Map<HTMLElement, number> = new Map();

	/**
	 * Initializes an observer
	 * @param observable
	 */
	protected initObserve(observable: ObservableElement): ObservableElement {
		const
			hash = this.getHash(observable),
			observer = this.observers[hash] || this.createObserver(observable, hash);

		observer.observe(observable.node);
		this.putInMap(this.elements, observable);

		return observable;
	}

	/** @override */
	protected remove(observable: ObservableElement): boolean {
		const observer = this.observers[this.getHash(observable)];

		if (observer) {
			observer.unobserve(observable.node);
			return true;
		}

		return false;
	}

	/**
	 * Returns a hash by given params
	 *
	 * @param intersectionObserverOptions
	 *   *) threshold
	 *   *) trackVisibility
	 *   *) root
	 */
	protected getHash({threshold, trackVisibility, root}: IntersectionObserverOptions): string {
		root = Object.isFunction(root) ? root() : root;

		let
			id = root && this.rootMap.get(root) || '';

		if (!id && root) {
			id = Math.random();
			this.rootMap.set(root, id);
		}

		return `${threshold.toFixed(2)}${Boolean(trackVisibility)}${id}`;
	}

	/**
	 * Creates a new IntersectionObserver instance
	 *
	 * @param opts
	 * @param hash
	 */
	protected createObserver(opts: IntersectionObserverOptions, hash: string): IntersectionObserver {
		const
			root = Object.isFunction(opts.root) ? opts.root() : opts.root,
			observerOpts = {...opts, root};

		delete observerOpts.delay;
		return this.observers[hash] = new IntersectionObserver(this.onIntersects.bind(this, opts.threshold), observerOpts);
	}

	/**
	 * Handler: entering or leaving viewport
	 *
	 * @param threshold
	 * @param entries
	 */
	protected onIntersects(threshold: number, entries: IntersectionObserverEntry[]): void {
		for (let i = 0; i < entries.length; i++) {
			const
				entry = entries[i],
				el = <HTMLElement>entry.target,
				observable = this.getEl(el, threshold);

			if (!observable) {
				return;
			}

			if (observable.isLeaving) {
				this.onObservableOut(observable);

			} else if (entry.intersectionRatio >= observable.threshold && !observable.isDeactivated) {
				this.onObservableIn(observable);
			}
		}
	}

	/**
	 * Handler: element becomes visible on viewport
	 * @param observable
	 */
	protected onObservableIn(observable: ObservableElement): void {
		const
			{async: $a} = this;

		const asyncOptions = {
			group: 'inView',
			label: observable.id,
			join: true
		};

		if (Object.isFunction(observable.onEnter)) {
			observable.onEnter(observable);
		}

		if (observable.delay) {
			$a.setTimeout(() => this.call(observable), observable.delay, asyncOptions);

		} else {
			this.call(observable);
		}

		observable.isLeaving = true;
	}

	/**
	 * Handler: element leaves viewport
	 * @param observable
	 */
	protected onObservableOut(observable: ObservableElement): void {
		const
			{async: $a} = this;

		const asyncOptions = {
			group: 'inView',
			label: observable.id,
			join: true
		};

		if (Object.isFunction(observable.onLeave)) {
			observable.onLeave(observable);
		}

		$a.clearAll(asyncOptions);
		observable.isLeaving = false;
	}
}
