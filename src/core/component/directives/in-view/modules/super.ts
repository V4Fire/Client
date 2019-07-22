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

	ObservableElement,
	ObservableElementsMap,
	IntersectionObserverOptions,
	ObserveOptions

} from 'core/component/directives/in-view/modules/meta';

export const
	$$ = symbolGenerator();

export default abstract class AbstractInView {
	/**
	 * Contains observable elements
	 */
	protected readonly elements: ObservableElementsMap = new Map();

	/**
	 * Queue of elements that wait to become observable
	 */
	protected readonly awaitingElements: ObservableElementsMap = new Map();

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
	 * Activates or deactivates elements by specified group
	 *
	 * @param isDeactivated
	 * @param [group]
	 */
	setGroupState(isDeactivated: boolean, group?: string): void {
		this.maps().forEach((el) => {
			if (!group || el.group !== group) {
				return;
			}

			el.isDeactivated = isDeactivated;
		});
	}

	/**
	 * Returns an observable element parameters
	 * @param el
	 */
	get(el: HTMLElement): CanUndef<ObservableElement> {
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
	 * Start observe elements
	 *
	 * @param el
	 * @param options
	 */
	observe(el: HTMLElement, options: IntersectionObserverOptions & ObserveOptions): ObservableElement | false {
		if (this.get(el)) {
			return false;
		}

		const
			observable = this.createObservable(el, options);

		if (observable.wait) {
			this.awaitingElements.set(el, observable);

		} else {
			this.initObserve(el, observable);
		}

		return observable;
	}

	/**
	 * Stop observe an element
	 * @param el
	 */
	stopObserve(el: HTMLElement): boolean {
		return false;
	}

	/**
	 * Creates a new observable element
	 */
	protected createObservable(el: HTMLElement, options: IntersectionObserverOptions & ObserveOptions): ObservableElement {
		return {
			node: el,
			count: true,
			isLeaving: false,
			isDeactivated: false,
			removeStrategy: 'remove',
			id: String(Math.random()),
			group: 'inView-base',
			threshold: 1,
			...options
		};
	}

	/**
	 * All maps combined into one
	 */
	protected maps(): ObservableElementsMap {
		return new Map([
			...this.elements,
			...this.awaitingElements
		]);
	}

	/**
	 * Returns a map which contains an element
	 * @param el
	 */
	protected getElMap(el: HTMLElement): Map<HTMLElement, ObservableElement> {
		return this.elements.has(el) ? this.elements : this.awaitingElements;
	}

	/**
	 * Initializes element from an observable queue
	 */
	protected popAwaiting(): void {
		const
			{awaitingElements} = this;

		awaitingElements.forEach((observable, el) => {
			const
				isResolved = Boolean(observable.wait && observable.wait());

			if (!isResolved) {
				return;
			}

			this.initObserve(el, observable);
			awaitingElements.delete(el);
		});
	}

	/**
	 * Removes all async operations from element
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
	 * Initializes observe
	 *
	 * @param el
	 * @param observable
	 */
	protected initObserve(el: HTMLElement, observable: ObservableElement): CanUndef<ObservableElement> {
		return undefined;
	}
}
