/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { AsyncOpts } from 'core/async';
import symbolGenerator from 'core/symbol';

import {

	ObservableElement,
	ObservableElementRect,
	ObservableElementsThresholdMap,
	InitOptions

} from 'core/component/directives/in-view/interface';

import {

	hasMutationObserver,
	getRootRect,
	getElementRect,
	isElementInView,
	isElementVisible

} from 'core/component/directives/in-view/mutation/helpers';

import Super from 'core/component/directives/in-view/super';
import { isInView } from 'core/component/directives/in-view/helpers';

export const
	$$ = symbolGenerator();

export type AdapteeType = 'mutation';

export default class InView extends Super {
	/**
	 * True if the current adaptee can be used
	 */
	static readonly acceptable: boolean = hasMutationObserver;

	/**
	 * Adaptee type
	 */
	readonly type: AdapteeType = 'mutation';

	/**
	 * Deferred variation of the recalculate function
	 * @see recalculate
	 */
	readonly recalculateDeffer: Function;

	/**
	 * Deferred variation of the check function
	 * @see recalculate
	 */
	readonly checkDeffer: Function;

	/**
	 * Mutation observer
	 */
	protected readonly mutationObserver: MutationObserver;

	/**
	 * Map contains an elements that needs to be poll
	 */
	protected readonly pollingElements: ObservableElementsThresholdMap = new Map();

	/**
	 * Contains an element position map
	 */
	protected map: Dictionary<ObservableElementRect[]> = {};

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

		const recalculateDeffer = (opts?: AsyncOpts) => $a.setTimeout(() => this.recalculate(), RECALCULATE_TIMEOUT, {
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

		this.mutationObserver.observe(document.body, {
			childList: true,
			attributes: true,
			subtree: true,
			characterData: true
		});

		$a.setInterval(this.poll, POLL_INTERVAL, {
			group: 'inView',
			label: $$.poll,
			join: true
		});

		$a.on(document, 'scroll', checkDeffer);
		$a.on(window, 'resize', () => recalculateDeffer({
			join: false
		}));
	}

	/** @override */
	observe(el: HTMLElement, opts: InitOptions): ObservableElement | false {
		const
			observable = super.observe(el, opts);

		if (!observable) {
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

	/** @override */
	stopObserve(el: HTMLElement, threshold?: number): boolean {
		const
			res = super.stopObserve(el, threshold);

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
			map.forEach((el) => {
				if (el.isDeactivated) {
					return;
				}

				const
					root = Object.isFunction(el.root) ? el.root() : el.root,
					isElementIn = isInView(el.node, el.threshold, root);

				if (isElementIn && !el.isLeaving) {
					this.onObservableIn(el);

				} else if (!isElementIn && el.isLeaving) {
					this.onObservableOut(el);
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
						observable = el.observable;

					if (observable.isDeactivated) {
						continue;
					}

					const
						isElementIn = isElementInView(el, rootRect, observable.threshold);

					if (isElementIn && !observable.isLeaving) {
						this.onObservableIn(observable);

					} else if (!isElementIn) {
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
			map: Dictionary<ObservableElementRect[]> = {},
			rootRect = getRootRect();

		this.elements.forEach((thresholdMap) => {
			thresholdMap.forEach((el) => {
				if (el.isDeactivated) {
					return;
				}

				const
					rect = getElementRect(rootRect, el.node);

				let listNum = Math.ceil(rect.top / 100);
				listNum = listNum === 0 ? 0 : listNum - 1;

				if (!isElementVisible(rect)) {
					this.clearAllAsync(el);
					return;
				}

				const tile = map[listNum] = map[listNum] || [];
				tile.push({...rect, observable: el});
			});
		});

		this.map = map;
	}

	/** @override */
	protected maps(): ObservableElementsThresholdMap {
		return new Map([
			...super.maps(),
			...this.pollingElements
		]);
	}

	/**
	 * Initializes an observer
	 * @param observable
	 */
	protected initObserve(observable: ObservableElement): ObservableElement {
		if (!observable.polling) {
			this.putInMap(this.elements, observable);
			this.recalculateDeffer();

		} else {
			this.putInMap(this.pollingElements, observable);
		}

		return observable;
	}

	/** @override */
	protected getElMap(el: HTMLElement): ObservableElementsThresholdMap {
		const res = super.getElMap(el);

		if (res) {
			return res;
		}

		return this.pollingElements;
	}

	/** @override */
	protected clearAllAsync(el: ObservableElement): void {
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
	protected onObservableIn(observable: ObservableElement): void {
		const asyncOptions = {
			group: 'inView',
			label: observable.id,
			join: true
		};

		if (Object.isFunction(observable.onEnter)) {
			observable.onEnter(observable);
		}

		observable.isLeaving = true;
		this.async.setTimeout(() => this.call(observable), observable.delay || 0, asyncOptions);
	}

	/**
	 * Handler: element leaves viewport
	 * @param observable
	 */
	protected onObservableOut(observable: ObservableElement): void {
		const asyncOptions = {
			group: 'inView',
			label: observable.id,
			join: true
		};

		if (Object.isFunction(observable.onLeave)) {
			observable.onLeave(observable);
		}

		observable.isLeaving = false;
		this.async.clearAll(asyncOptions);
	}
}
