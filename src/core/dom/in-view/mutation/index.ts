/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import type { AsyncOptions } from 'core/async';

import type {

	InViewObservableElement,
	InViewObservableElementRect,
	InViewObservableElementsThresholdMap,
	InViewInitOptions,
	InViewUnobserveOptions

} from 'core/dom/in-view/interface';

import {

	hasMutationObserver,
	getRootRect,
	getElementRect,
	isElementInView,
	isElementVisible

} from 'core/dom/in-view/mutation/helpers';

import Super from 'core/dom/in-view/super';
import { isInView } from 'core/dom/in-view/helpers';

export const
	$$ = symbolGenerator();

export type AdapteeType = 'mutation';

export default class InView extends Super {
	/**
	 * Adaptee type
	 */
	readonly type: AdapteeType = 'mutation';

	/**
	 * Deferred version of the recalculate function
	 * @see recalculate
	 */
	readonly recalculateDeffer: Function;

	/**
	 * Deferred version of the check function
	 * @see recalculate
	 */
	readonly checkDeffer: Function;

	/**
	 * True if the current adaptee can be used
	 */
	static readonly acceptable: boolean = hasMutationObserver;

	/**
	 * Mutation observer
	 */
	protected readonly mutationObserver: MutationObserver;

	/**
	 * Map of elements that needs to be poll
	 */
	protected readonly pollingElements: InViewObservableElementsThresholdMap = new Map();

	/**
	 * Map of element positions
	 */
	protected map: Dictionary<InViewObservableElementRect[]> = {};

	/**
	 * Initializes an observer
	 */
	constructor() {
		super();

		const
			RECALCULATE_TIMEOUT = 100,
			POLL_INTERVAL = 75,
			CHECK_TIMEOUT = 50;

		const
			{async: $a} = this;

		const checkDeffer = () => $a.setTimeout(() => this.check(), CHECK_TIMEOUT, {
			group: 'inView',
			label: $$.check,
			join: true
		});

		const recalculateDeffer = (opts?: AsyncOptions) => $a.setTimeout(() => this.recalculate(), RECALCULATE_TIMEOUT, {
			group: 'inView',
			label: $$.recalculate,
			join: true,
			...opts
		});

		this.checkDeffer = checkDeffer;
		this.recalculateDeffer = recalculateDeffer;

		this.mutationObserver = new MutationObserver(() => {
			this.recalculateDeffer();
		});

		this.async.wait(() => Boolean(document.body), {label: $$.waitBody}).then(() => {
			this.mutationObserver.observe(document.body, {
				childList: true,
				attributes: true,
				subtree: true,
				characterData: true
			});

			$a.setInterval(this.poll.bind(this), POLL_INTERVAL, {
				group: 'inView',
				label: $$.poll,
				join: true
			});

			$a.on(document, 'scroll', checkDeffer);
			$a.on(globalThis, 'resize', () => recalculateDeffer({
				join: false
			}));

		}).catch(stderr);
	}

	override observe(el: Element, opts: InViewInitOptions): InViewObservableElement | false {
		const
			observable = super.observe(el, opts);

		if (observable === false) {
			return false;
		}

		const
			{async: $a} = this;

		if (observable.handleTransitionEnd) {
			$a.on(el, 'transitionend', this.recalculateDeffer, {
				group: 'inView',
				label: `transitionend-${el.id}`
			});
		}

		return observable;
	}

	override unobserve(el: Element, unobserveOptsOrThreshold?: InViewUnobserveOptions | number): boolean {
		const
			res = super.unobserve(el, unobserveOptsOrThreshold);

		if (!this.pollingElements.has(el)) {
			this.recalculateDeffer();
		}

		return res;
	}

	/**
	 * Polls elements
	 */
	poll(): void {
		this.pollingElements.forEach((map) => {
			map.forEach((observable) => {
				const
					root = Object.isFunction(observable.root) ? observable.root() : observable.root,
					elRect = observable.node.getBoundingClientRect(),
					isElementIn = isInView(elRect, observable.threshold, root);

				this.setObservableSize(observable, elRect);

				if (isElementIn && !observable.isLeaving) {
					this.onObservableIn(observable);

				} else if (!isElementIn && observable.isLeaving) {
					this.onObservableOut(observable);
				}
			});
		});
	}

	/**
	 * Checks if elements is in view
	 */
	check(): void {
		const
			rootRect = getRootRect();

		const
			checkRangeTo = Math.ceil((rootRect.height + rootRect.scrollTop) / 100) + 1,
			checkRangeFrom = Math.ceil(rootRect.scrollTop / 100);

		let
			start = checkRangeFrom - 1 >= 0 ? 0 : checkRangeFrom - 1;

		while (start !== checkRangeTo) {
			const
				elements = this.map[start];

			if (elements) {
				for (let i = 0; i < elements.length; i++) {
					const
						el = elements[i],
						{observable} = el;

					const
						// An old chromium does not support isConnected
						// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
						isConnected = observable.node.isConnected ?? true,
						isElementIn = isElementInView(el, rootRect, observable.threshold);

					if (isConnected && isElementIn && !observable.isLeaving) {
						this.onObservableIn(observable);

					} else if (!isConnected || !isElementIn) {
						this.onObservableOut(observable);
					}

				}
			}

			start++;
		}
	}

	/**
	 * Recalculates all elements
	 */
	recalculate(): void {
		this.createMap();
		this.check();
	}

	/**
	 * Creates a position map of elements
	 */
	protected createMap(): void {
		const
			map: Dictionary<InViewObservableElementRect[]> = {},
			rootRect = getRootRect();

		this.elements.forEach((thresholdMap) => {
			thresholdMap.forEach((observable) => {
				const
					rect = getElementRect(rootRect, observable.node);

				let listNum = Math.ceil(rect.top / 100);
				listNum = listNum === 0 ? 0 : listNum - 1;

				this.setObservableSize(observable, rect);

				if (!isElementVisible(rect)) {
					this.clearAllAsync(observable);
					return;
				}

				// eslint-disable-next-line no-multi-assign
				const tile = map[listNum] = map[listNum] ?? [];
				tile.push({...rect, observable});
			});
		});

		this.map = map;
	}

	protected override maps(): InViewObservableElementsThresholdMap {
		return new Map([
			...super.maps(),
			...this.pollingElements
		]);
	}

	protected override initObserve(observable: InViewObservableElement): InViewObservableElement {
		if (!observable.polling) {
			this.putInMap(this.elements, observable);
			this.recalculateDeffer();

		} else {
			this.putInMap(this.pollingElements, observable);
		}

		return observable;
	}

	protected override getElMap(el: Element): InViewObservableElementsThresholdMap {
		const res = super.getElMap(el);

		if (res.has(el)) {
			return res;
		}

		return this.pollingElements;
	}

	protected override clearAllAsync(el: InViewObservableElement): void {
		const
			{async: $a} = this;

		$a.clearAll({
			group: 'inView',
			label: `transitionend-${el.id}`
		});

		super.clearAllAsync(el);
	}

	/**
	 * Handler: element becomes visible on viewport
	 * @param observable
	 */
	protected onObservableIn(observable: InViewObservableElement): void {
		const asyncOptions = {
			group: 'inView',
			label: observable.id,
			join: true
		};

		const highResTimeStamp = performance.now();
		observable.time = highResTimeStamp;
		observable.timeIn = highResTimeStamp;

		// eslint-disable-next-line @typescript-eslint/unbound-method
		if (Object.isFunction(observable.onEnter)) {
			observable.onEnter(observable);
		}

		observable.isLeaving = true;

		if (observable.delay != null && observable.delay > 0) {
			this.async.setTimeout(() => this.call(observable), observable.delay, asyncOptions);

		} else {
			this.call(observable);
		}
	}

	/**
	 * Handler: element leaves viewport
	 * @param observable
	 */
	protected onObservableOut(observable: InViewObservableElement): void {
		const asyncOptions = {
			group: 'inView',
			label: observable.id,
			join: true
		};

		const highResTimeStamp = performance.now();
		observable.time = highResTimeStamp;
		observable.timeOut = highResTimeStamp;

		// eslint-disable-next-line @typescript-eslint/unbound-method
		if (Object.isFunction(observable.onLeave)) {
			observable.onLeave(observable);
		}

		observable.isLeaving = false;
		this.async.clearAll(asyncOptions);
	}
}
