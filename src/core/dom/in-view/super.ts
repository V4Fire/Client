/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import Async from 'core/async';

import type {

	InViewGroup,
	InViewInitOptions,

	InViewObservableElement,
	InViewObservableElementsThresholdMap,
	InViewObservableThresholdMap,

	InViewObservableElSize,
	InViewUnobserveOptions,
	InViewObservablesByGroup

} from 'core/dom/in-view/interface';

export const
	$$ = symbolGenerator();

export default abstract class AbstractInView {
	/**
	 * Map of observable elements
	 */
	protected readonly elements: InViewObservableElementsThresholdMap = new Map();

	/**
	 * Map of observable elements sorted by a group parameter
	 */
	protected readonly observablesByGroup: InViewObservablesByGroup = new Map();

	/**
	 * Map of elements that was suspended
	 */
	protected readonly suspendedElements: InViewObservableElementsThresholdMap = new Map();

	/**
	 * Queue of elements that wait to become observable
	 */
	protected readonly awaitingElements: InViewObservableElementsThresholdMap = new Map();

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
				node = groupOrElement,
				{suspendedElements} = this;

			if (threshold == null) {
				return;
			}

			const
				observable = this.getEl(node, threshold);

			if (observable == null) {
				return;
			}

			let
				map = suspendedElements.get(node);

			if (map == null) {
				suspendedElements.set(node, map = new Map());
			}

			map.set(threshold, observable);
			this.unobserve(node, {threshold, suspend: true});

		} else {
			this.observablesByGroup.get(groupOrElement)?.forEach((elMap) => {
				elMap.forEach((observable) => {
					this.unobserve(observable.node, {threshold: observable.threshold, suspend: true});
				});
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
		const
			fieldsToReject = ['id', 'isLeaving'];

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
			this.observe(observable.node, <InViewInitOptions>Object.reject(observable, fieldsToReject));

		} else {
			this.observablesByGroup.get(groupOrElement)?.forEach((elMap) => {
				elMap.forEach((observable) => {
					this.observe(observable.node, <InViewInitOptions>Object.reject(observable, fieldsToReject));
				});
			});
		}
	}

	/**
	 * Returns an observable element
	 *
	 * @param el
	 * @param threshold
	 */
	getEl(el: Element, threshold: number): CanUndef<InViewObservableElement> {
		const map = this.getThresholdMap(el);
		return map?.get(threshold);
	}

	/**
	 * Returns a threshold map of the specified element
	 * @param el
	 */
	getThresholdMap(el: Element): CanUndef<InViewObservableThresholdMap> {
		return this.getElMap(el).get(el);
	}

	/**
	 * Calls an observer function from the specified object
	 * @param observable
	 */
	call(observable: InViewObservableElement): void {
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
	observe(el: Element, opts: InViewInitOptions): InViewObservableElement | false {
		if (this.getEl(el, opts.threshold)) {
			return false;
		}

		const
			{observablesByGroup} = this,
			observable = this.createObservable(el, opts);

		if (observable.group != null) {
			let elMap: Map<Element, Map<number, InViewObservableElement>>;

			if (observablesByGroup.has(observable.group)) {
				elMap = observablesByGroup.get(observable.group)!;

			} else {
				observablesByGroup.set(observable.group, elMap = new Map());
			}

			const
				initialMap = elMap.get(el),
				thresholdMap = initialMap ?? new Map();

			thresholdMap.set(observable.threshold, observable);

			if (!initialMap) {
				elMap.set(el, thresholdMap);
			}
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
	 * @param [threshold]
	 */
	reObserve(groupOrElement: InViewGroup | Element, threshold?: number): void {
		this.suspend(groupOrElement, threshold);
		this.unsuspend(groupOrElement, threshold);
	}

	/**
	 * Removes or suspends the specified element
	 *
	 * @param el
	 * @param [unobserveOptsOrThreshold]
	 */
	unobserve(el: Element, unobserveOptsOrThreshold?: InViewUnobserveOptions | number): boolean {
		let
			threshold: CanUndef<number>,
			suspend: CanUndef<boolean>;

		if (Object.isNumber(unobserveOptsOrThreshold)) {
			threshold = unobserveOptsOrThreshold;

		} else if (Object.isPlainObject(unobserveOptsOrThreshold)) {
			threshold = unobserveOptsOrThreshold.threshold;
			suspend = unobserveOptsOrThreshold.suspend;
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
			thresholdMap.delete(threshold);

			if (thresholdMap.size === 0) {
				map.delete(el);
			}

			return true;
		}

		return false;
	}

	/**
	 * Creates a new observable element
	 *
	 * @param el
	 * @param opts
	 */
	protected createObservable(el: Element, opts: InViewInitOptions): InViewObservableElement {
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
	protected createThresholdMap(observable: InViewObservableElement): InViewObservableThresholdMap {
		return new Map([[observable.threshold, observable]]);
	}

	/**
	 * Puts an observable element into the specified map
	 *
	 * @param map
	 * @param observable
	 */
	protected putInMap(
		map: InViewObservableElementsThresholdMap,
		observable: InViewObservableElement
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
	protected maps(): InViewObservableElementsThresholdMap {
		return new Map([
			...this.elements,
			...this.awaitingElements
		]);
	}

	/**
	 * Returns a map which contains the specified element
	 * @param el
	 */
	protected getElMap(el: Element): InViewObservableElementsThresholdMap {
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
	protected setObservableSize(observable: InViewObservableElement, size: InViewObservableElSize): void {
		observable.size.width = size.width;
		observable.size.height = size.height;
	}

	/**
	 * Removes all async operations from the specified element
	 * @param el
	 */
	protected clearAllAsync(el: InViewObservableElement): void {
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
	protected initObserve(observable: InViewObservableElement): CanUndef<InViewObservableElement> {
		return undefined;
	}

	/**
	 * Removes an element from the observer data
	 *
	 * @param observable
	 * @param [suspend]
	 */
	protected remove(observable: InViewObservableElement, suspend?: boolean): boolean {
		if (!suspend) {
			if (observable.group != null) {
				this.observablesByGroup.get(observable.group)?.delete(observable.node);
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
