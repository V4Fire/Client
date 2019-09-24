/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import symbolGenerator from 'core/symbol';

import {

	InitOptions,
	ObservableElement,
	ObservableElementsThresholdMap,
	ObservableThresholdMap

} from 'core/component/directives/in-view/interface';

export const
	$$ = symbolGenerator();

export default abstract class AbstractInView {
	/**
	 * Contains observable elements
	 */
	protected readonly elements: ObservableElementsThresholdMap = new Map();

	/**
	 * Queue of elements that wait to become observable
	 */
	protected readonly awaitingElements: ObservableElementsThresholdMap = new Map();

	/**
	 * Async instance
	 */
	protected readonly async: Async<this> = new Async(this);

	/**
	 * Initializes inView
	 */
	protected constructor() {
		const
			POP_AWAITING_INTERVAL = 75;

		this.async.setInterval(() => {
			if (!this.awaitingElements.size) {
				return;
			}

			this.popAwaiting();

		}, POP_AWAITING_INTERVAL, {
			group: 'inView',
			label: $$.queuePop,
			join: true
		});
	}

	/**
	 * Activates or deactivates elements by the specified group
	 *
	 * @param isDeactivated
	 * @param [group]
	 */
	setGroupState(isDeactivated: boolean, group?: string): void {
		this.maps().forEach((map) => {
			map.forEach((el) => {
				if (!group || el.group !== group) {
					return;
				}

				el.isDeactivated = isDeactivated;
			});
		});
	}

	/**
	 * Returns an observable element parameters
	 * @param el
	 * @param threshold
	 */
	getEl(el: HTMLElement, threshold: number): CanUndef<ObservableElement> {
		const map = this.getThresholdMap(el);
		return map && map.get(threshold);
	}

	/**
	 * Returns a threshold map of element
	 *
	 * @param el
	 */
	getThresholdMap(el: HTMLElement): CanUndef<ObservableThresholdMap> {
		return this.getElMap(el).get(el);
	}

	/**
	 * Calls an observer function from the specified object
	 * @param observable
	 */
	call(observable: ObservableElement): void {
		if (observable.isDeactivated) {
			return;
		}

		const count = Object.isFunction(observable.count) ?
			observable.count() :
			observable.count;

		if (!count) {
			return;
		}

		if (observable.callback) {
			observable.callback(observable);
		}

		if (observable.once) {
			this.stopObserve(observable.node);
		}
	}

	/**
	 * Starts observing of elements
	 * @param el
	 * @param opts
	 */
	observe(el: HTMLElement, opts: InitOptions): ObservableElement | false {
		if (this.getEl(el, opts.threshold)) {
			return false;
		}

		const
			observable = this.createObservable(el, opts);

		if (observable.wait) {
			this.putInMap(this.awaitingElements, observable);

		} else {
			this.initObserve(observable);
		}

		return observable;
	}

	/**
	 * Stops observing the specified element
	 * @param el
	 */
	stopObserve(el: HTMLElement, threshold?: number): boolean {
		const
			thresholdMap = this.getThresholdMap(el);

		const stopObserve = (o) => {
			this.clearAllAsync(o);

			if (o.removeStrategy === 'remove') {
				return this.remove(el, threshold);
			}

			o.isDeactivated = true;
			return true;
		};

		if (thresholdMap && threshold === undefined) {
			thresholdMap.forEach((observable) => {
				stopObserve(observable);
			});

			return true;
		}

		if (thresholdMap && threshold !== undefined) {
			const
				observable = thresholdMap.get(threshold);

			if (!observable) {
				return false;
			}

			return stopObserve(observable);
		}

		return false;
	}

	/**
	 * Removes an element from observable elements
	 * @param el
	 * @param [threshold]
	 */
	remove(el: HTMLElement, threshold?: number): boolean {
		const
			map = this.getElMap(el),
			thresholdMap = this.getThresholdMap(el);

		if (thresholdMap && threshold === undefined) {
			thresholdMap.forEach((observable) => {
				this.unobserve(observable);
			});

			return map.delete(el);
		}

		if (thresholdMap && threshold !== undefined) {
			const
				observable = thresholdMap.get(threshold);

			if (!observable) {
				return false;
			}

			this.unobserve(observable);
			return thresholdMap.delete(threshold);
		}

		return false;
	}

	/**
	 * Creates a new observable element
	 *
	 * @param el
	 * @param opts
	 */
	protected createObservable(el: HTMLElement, opts: InitOptions): ObservableElement {
		return {
			node: el,
			count: true,
			isLeaving: false,
			isDeactivated: false,
			removeStrategy: 'remove',
			id: String(Math.random()),
			group: 'inView-base',
			threshold: 1,
			...opts
		};
	}

	/**
	 * Creates a threshold map
	 * @param observable
	 */
	protected createThresholdMap(observable: ObservableElement): ObservableThresholdMap {
		return new Map([[observable.threshold, observable]]);
	}

	/**
	 * Puts an observable element in specified map
	 *
	 * @param map
	 * @param observable
	 */
	protected putInMap(
		map: ObservableElementsThresholdMap,
		observable: ObservableElement
	): boolean {
		const
			thresholdMap = map.get(observable.node);

		if (thresholdMap && !thresholdMap.has(observable.threshold)) {
			return Boolean(thresholdMap.set(observable.threshold, observable));
		}

		if (!thresholdMap) {
			return Boolean(map.set(observable.node, this.createThresholdMap(observable)));
		}

		return false;
	}

	/**
	 * All maps combined into one
	 */
	protected maps(): ObservableElementsThresholdMap {
		return new Map([
			...this.elements,
			...this.awaitingElements
		]);
	}

	/**
	 * Returns a map which contains an element
	 * @param el
	 */
	protected getElMap(el: HTMLElement): ObservableElementsThresholdMap {
		return this.elements.has(el) ? this.elements : this.awaitingElements;
	}

	/**
	 * Initializes element from an observable queue
	 */
	protected popAwaiting(): void {
		const
			{awaitingElements} = this;

		awaitingElements.forEach((map, node) => {
			map.forEach((observable, threshold) => {
				const
					isResolved = Boolean(observable.wait && observable.wait());

				if (!isResolved) {
					return;
				}

				this.initObserve(observable);
				map.delete(threshold);
			});

			if (map.size === 0) {
				awaitingElements.delete(node);
			}

		});
	}

	/**
	 * Removes all async operations from the specified element
	 * @param el
	 */
	protected clearAllAsync(el: ObservableElement): void {
		const
			{async: $a} = this;

		$a.clearAll({
			group: 'inView',
			label: el.id
		});
	}

	/**
	 * Initializes observing for the specified element
	 *
	 * @param observable
	 */
	protected initObserve(observable: ObservableElement): CanUndef<ObservableElement> {
		return undefined;
	}

	/**
	 * Removes element from observer data
	 * @param observable
	 */
	protected unobserve(observable: ObservableElement): boolean {
		return false;
	}
}
