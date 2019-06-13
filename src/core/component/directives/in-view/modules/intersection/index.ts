/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import Super from 'core/component/directives/in-view/modules/super';
import { ObservableElement, IntersectionObserverOptions } from 'core/component/directives/in-view/modules/meta';
import { hasIntersection } from 'core/component/directives/in-view/modules/intersection/helpers';

export const
	$$ = symbolGenerator();

export type AdapteeType = 'observer';

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
	 * Removes an element from observable elements
	 * @param el
	 */
	remove(el: HTMLElement): boolean {
		const
			observable = this.get(el);

		if (!observable) {
			return false;
		}

		const
			observer = this.observers[this.getHash(observable)];

		if (observer) {
			observer.unobserve(el);
		}

		return this.getElMap(el).delete(el);
	}

	/**
	 * Stop observe an element
	 * @param el
	 */
	stopObserve(el: HTMLElement): boolean {
		const
			observable = this.get(el);

		if (!observable) {
			return false;
		}

		this.clearAllAsync(observable);

		if (observable.removeStrategy === 'remove') {
			return this.remove(el);
		}

		observable.isDeactivated = true;
		return true;
	}

	/**
	 * Initializes an observer
	 *
	 * @param el
	 * @param observable
	 */
	protected initObserve(el: HTMLElement, observable: ObservableElement): ObservableElement {
		const
			hash = this.getHash(observable),
			observer = this.observers[hash] || this.createObserver(observable, hash);

		observer.observe(el);
		this.elements.set(el, observable);
		return observable;
	}

	/**
	 * Returns a hash by given params
	 *
	 * @param intersectionObserverOptions
	 *   *) threshold
	 */
	protected getHash({threshold}: IntersectionObserverOptions): string {
		return String(threshold);
	}

	/**
	 * Creates a new IntersectionObserver instance
	 *
	 * @param initOptions
	 * @param hash
	 */
	protected createObserver(initOptions: IntersectionObserverOptions, hash: string): IntersectionObserver {
		return this.observers[hash] = new IntersectionObserver(this.onIntersects.bind(this), initOptions);
	}

	/**
	 * Handler: entering or leaving viewport
	 * @param entries
	 */
	protected onIntersects(entries: IntersectionObserverEntry[]): void {
		for (let i = 0; i < entries.length; i++) {
			const
				entry = entries[i],
				el = <HTMLElement>entry.target,
				observable = this.get(el);

			if (!observable) {
				return;
			}

			const
				{async: $a} = this;

			const asyncOptions = {
				group: 'inView',
				label: observable.id,
				join: true
			};

			if (observable.isLeaving) {
				observable.isLeaving = false;
				$a.clearAll(asyncOptions);

			} else if (entry.intersectionRatio >= observable.threshold && !observable.isDeactivated) {
				observable.isLeaving = true;
				$a.setTimeout(() => this.call(observable), observable.timeout || 0, asyncOptions);
			}
		}
	}
}
