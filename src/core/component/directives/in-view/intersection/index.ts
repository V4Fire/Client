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
	protected readonly observers: Map<string, IntersectionObserver> = new Map();

	/**
	 * Map of ids for root elements
	 */
	protected readonly rootMap: Map<Element, number> = new Map();

	/** @override */
	constructor() {
		super();
	}

	/**
	 * Initializes an observer
	 * @param observable
	 */
	protected initObserve(observable: ObservableElement): ObservableElement {
		const
			observer = this.createObserver(observable);

		observer.observe(observable.node);
		this.putInMap(this.elements, observable);

		return observable;
	}

	/** @override */
	protected remove(observable: ObservableElement): boolean {
		const observer = this.observers.get(observable.id);

		if (observer) {
			observer.unobserve(observable.node);
			this.observers.delete(observable.id);
			return true;
		}

		return false;
	}

	/**
	 * Creates a new IntersectionObserver instance
	 * @param observable
	 */
	protected createObserver(observable: ObservableElement): IntersectionObserver {
		const
			root = Object.isFunction(observable.root) ? observable.root() : observable.root,
			opts = {...observable, root};

		delete opts.delay;

		const
			observer = new IntersectionObserver(this.onIntersects.bind(this, observable.threshold), opts);

		this.observers.set(observable.id, observer);
		return observer;
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
				el = <Element>entry.target,
				observable = this.getEl(el, threshold);

			if (!observable) {
				return;
			}

			this.setObservableSize(observable, entry.boundingClientRect);

			if (observable.isLeaving) {
				this.onObservableOut(observable, entry);

			} else if (entry.intersectionRatio >= observable.threshold && !observable.isDeactivated) {
				this.onObservableIn(observable, entry);
			}
		}
	}

	/**
	 * Handler: element becomes visible on viewport
	 *
	 * @param observable
	 * @param entry
	 */
	protected onObservableIn(observable: ObservableElement, entry: IntersectionObserverEntry): void {
		const
			{async: $a} = this;

		const asyncOptions = {
			group: 'inView',
			label: observable.id,
			join: true
		};

		observable.time = entry.time;
		observable.timeIn = entry.time;

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
	 *
	 * @param observable
	 * @param entry
	 */
	protected onObservableOut(observable: ObservableElement, entry: IntersectionObserverEntry): void {
		const
			{async: $a} = this;

		observable.time = entry.time;
		observable.timeOut = entry.time;

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
