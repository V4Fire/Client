/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import Async from 'core/async';

import {

	InViewGroup,
	InitOptions,

	ObservableElement,
	ObservableElementsThresholdMap,
	ObservableThresholdMap,
	ObservablesByGroup,

	Size,
	UnobserveOptions

} from 'core/component/directives/in-view/interface';

export const
	$$ = symbolGenerator();

export default abstract class AbstractInView {
	/**
	 * Map of observable elements
	 */
	protected readonly elements: ObservableElementsThresholdMap = new Map();

	/**
	 * Map of observable elements sorted by a group parameter
	 */
	protected readonly observablesByGroup: ObservablesByGroup = new Map();

	/**
	 * Map of elements that was suspended
	 */
	protected readonly suspendedElements: ObservableElementsThresholdMap = new Map();

	/**
	 * Queue of elements that wait to become observable
	 */
	protected readonly awaitingElements: ObservableElementsThresholdMap = new Map();

	/**
	 * Async instance
	 */
	// eslint-disable-next-line @typescript-eslint/no-invalid-this
	protected readonly async: Async<this> = new Async(this);

	/**
	 * Initializes inView
	 */
	protected constructor() {
		const
			POP_AWAITING_INTERVAL = 75;

		this.async.setInterval(() => {
			if (this.awaitingElements.size === 0) {
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
	 * Suspends the specified element or elements by the specified group
	 *
	 * @param groupOrElement
	 * @param [threshold]
	 */
	suspend(groupOrElement: InViewGroup | Element, threshold?: number): void {
		if (groupOrElement instanceof Element) {
			const
				{suspendedElements} = this;

			if (threshold == null) {
				return;
			}

			const
				observable = this.getEl(groupOrElement, threshold);

			if (observable == null) {
				return;
			}

			let
				map = suspendedElements.get(groupOrElement);

			if (map == null) {
				suspendedElements.set(groupOrElement, map = new Map());
			}

			map.set(threshold, observable);

		} else {
			this.observablesByGroup.get(groupOrElement)?.forEach((observable) => {
				this.unobserve(observable.node, {threshold: observable.threshold, suspend: true});
			});
		}
	}

	/**
	 * Unsuspends the specified element or elements by the specified group
	 *
	 * @param groupOrElement
	 * @param [threshold]
	 */
	unsuspend(groupOrElement: InViewGroup | Element, threshold?: number): void {
		if (groupOrElement instanceof Element) {
			const
				{suspendedElements} = this;

			if (threshold == null) {
				return;
			}

			const
				map = suspendedElements.get(groupOrElement),
				observable = map?.get(threshold);

			if (observable == null || map == null) {
				return;
			}

			map.delete(threshold);
			this.observe(observable.node, observable);

		} else {
			this.observablesByGroup.get(groupOrElement)?.forEach((observable) => {
				this.observe(observable.node, observable);
			});
		}
	}

	/**
	 * Returns an observable element
	 *
	 * @param el
	 * @param threshold
	 */
	getEl(el: Element, threshold: number): CanUndef<ObservableElement> {
		const map = this.getThresholdMap(el);
		return map?.get(threshold);
	}

	/**
	 * Returns a threshold map of the specified element
	 * @param el
	 */
	getThresholdMap(el: Element): CanUndef<ObservableThresholdMap> {
		return this.getElMap(el).get(el);
	}

	/**
	 * Calls an observer function from the specified object
	 * @param observable
	 */
	call(observable: ObservableElement): void {
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
			this.unobserve(observable.node, observable.threshold);
		}
	}

	/**
	 * Starts to observe an element
	 *
	 * @param el
	 * @param opts
	 */
	observe(el: Element, opts: InitOptions): ObservableElement | false {
		if (this.getEl(el, opts.threshold)) {
			return false;
		}

		const
			{observablesByGroup} = this,
			observable = this.createObservable(el, opts);

		if (observable.group != null) {
			let observableSet: Set<ObservableElement>;

			if (observablesByGroup.has(observable.group)) {
				observableSet = observablesByGroup.get(observable.group)!;

			} else {
				observablesByGroup.set(observable.group, observableSet = new Set());
			}

			observableSet.add(observable);
		}

		if (observable.wait) {
			this.putInMap(this.awaitingElements, observable);

		} else {
			this.initObserve(observable);
		}

		return observable;
	}

	/**
	 * Re-initializes observation of the specified element or group
	 *
	 * @param groupOrElement
	 * @param threshold
	 */
	reObserve(groupOrElement: InViewGroup | Element, threshold?: number): void {
		if (threshold != null) {
			this.suspend(<Element>groupOrElement, threshold);
			this.unsuspend(<Element>groupOrElement, threshold);

		} else {
			this.suspend(<InViewGroup>groupOrElement);
			this.unsuspend(<InViewGroup>groupOrElement);
		}
	}

	/**
	 * Removes or suspends the specified element
	 *
	 * @param el
	 * @param unobserveOptionsOrThreshold
	 */
	unobserve(el: Element, unobserveOptionsOrThreshold?: UnobserveOptions | number): boolean {
		let
			threshold: CanUndef<number>,
			suspend: CanUndef<boolean>;

		if (Object.isNumber(unobserveOptionsOrThreshold)) {
			threshold = unobserveOptionsOrThreshold;

		} else if (Object.isPlainObject(unobserveOptionsOrThreshold)) {
			threshold = unobserveOptionsOrThreshold.threshold;
			suspend = unobserveOptionsOrThreshold.suspend;
		}

		const
			map = this.getElMap(el),
			thresholdMap = this.getThresholdMap(el);

		if (thresholdMap && threshold === undefined) {
			thresholdMap.forEach((observable) => {
				this.remove(observable, suspend);
			});

			return map.delete(el);
		}

		if (thresholdMap && threshold !== undefined) {
			const
				observable = thresholdMap.get(threshold);

			if (!observable) {
				return false;
			}

			this.remove(observable, suspend);
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
	protected createObservable(el: Element, opts: InitOptions): ObservableElement {
		return {
			id: String(Math.random()),
			group: 'inView:base',

			node: el,
			count: true,

			isLeaving: false,

			// @ts-expect-error (override)
			threshold: 1,

			size: {
				width: 0,
				height: 0
			},

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
	 * Puts an observable element into the specified map
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
	 * Returns all maps combined into one
	 */
	protected maps(): ObservableElementsThresholdMap {
		return new Map([
			...this.elements,
			...this.awaitingElements
		]);
	}

	/**
	 * Returns a map which contains the specified element
	 * @param el
	 */
	protected getElMap(el: Element): ObservableElementsThresholdMap {
		return this.elements.has(el) ? this.elements : this.awaitingElements;
	}

	/**
	 * Initializes an element from the observable queue
	 */
	protected popAwaiting(): void {
		const
			{awaitingElements} = this;

		awaitingElements.forEach((map, node) => {
			map.forEach((observable, threshold) => {
				const
					isResolved = Boolean(observable.wait?.());

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
	 * Sets a size of the specified observable element
	 *
	 * @param observable
	 * @param size
	 */
	protected setObservableSize(observable: ObservableElement, size: Size): void {
		observable.size.width = size.width;
		observable.size.height = size.height;
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
	 * @param observable
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
	protected initObserve(observable: ObservableElement): CanUndef<ObservableElement> {
		return undefined;
	}

	/**
	 * Removes an element from the observer data
	 *
	 * @param observable
	 * @param [suspend]
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
	protected remove(observable: ObservableElement, suspend?: boolean): boolean {
		if (!suspend) {
			if (observable.group != null) {
				this.observablesByGroup.get(observable.group)?.delete(observable);
			}

			const
				map = this.suspendedElements.get(observable.node);

			if (map) {
				map.delete(observable.threshold);

				if (map.size === 0) {
					this.suspendedElements.delete(observable.node);
				}
			}
		}

		this.clearAllAsync(observable);
		return true;
	}
}
