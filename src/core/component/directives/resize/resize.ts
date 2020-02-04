/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import symbolGenerator from 'core/symbol';
import { ObserverOptions, Observable, Size } from 'core/component/directives/resize/interface';

export const
	$$ = symbolGenerator();

export default class Resize {
	/**
	 * True if the environment supports ResizeObserver
	 */
	get hasResizeObserver(): boolean {
		return 'ResizeObserver' in globalThis;
	}

	/**
	 * Map of observable elements
	 */
	protected elements: Map<Element, Observable> = new Map();

	/**
	 * Queue of size calculation tasks
	 * (only for environments that aren't support ResizeObserver)
	 */
	protected calculateQueue: Observable[] = [];

	/**
	 * Async instance
	 */
	protected async: Async<this> = new Async(this);

	constructor() {
		if (!this.hasResizeObserver) {
			this.initResizeEvent();
		}
	}

	/**
	 * Starts to observe resize for the specified element
	 *
	 * @param el
	 * @param params
	 */
	observe(el: HTMLElement, params: ObserverOptions): boolean {
		if (this.elements.has(el)) {
			return false;
		}

		const
			observable = this.createObservable(el, params);

		if (this.hasResizeObserver) {
			this.createResizeObserver(observable);

		} else {
			this.calculateQueue.push(observable);
			this.async.setTimeout(this.calculate.bind(this), 100, {label: $$.calculateTimeout, join: true});
		}

		this.elements.set(el, observable);
		return true;
	}

	/**
	 * Stops to observe resize on the specified element
	 * @param el
	 */
	unobserve(el: HTMLElement): boolean {
		const observable = this.elements.get(el);
		observable?.observer?.disconnect();
		return this.elements.delete(el);
	}

	/**
	 * Clears all observers
	 */
	clear(): void {
		this.elements.forEach(({observer}) => {
			observer && observer.disconnect();
		});

		this.elements.clear();
	}

	/**
	 * Creates a new observable element
	 *
	 * @param el
	 * @param params
	 */
	protected createObservable(el: HTMLElement, params: ObserverOptions): Observable {
		return {
			node: el,
			...params
		};
	}

	/**
	 * Creates an instance of ResizeObserver
	 * @param observable
	 */
	protected createResizeObserver(observable: Observable): void {
		const getSize = (rect) => ({
			width: Math.floor(rect.width),
			height: Math.floor(rect.height)
		});

		observable.observer = new ResizeObserver(([{contentRect}]) => {
			const
				newSize = getSize(contentRect);

			if (observable.height === undefined) {
				this.setInitialSize(observable, newSize);
				return;
			}

			this.onElementResize(observable, newSize);
		});

		observable.observer.observe(observable.node);
	}

	/**
	 * Sets an initial size of the specified observable
	 *
	 * @param observable
	 * @param size
	 */
	protected setInitialSize(observable: Observable, size: Size): void {
		Object.assign(observable, size);

		if (observable.immediate) {
			observable.callback(observable, size);
		}
	}

	/**
	 * Calculates size of elements
	 */
	protected calculate(): void {
		if (!this.calculateQueue.length) {
			return;
		}

		this.async.requestAnimationFrame(() => {
			for (let i = 0; i < this.calculateQueue.length; i++) {
				const
					observable = this.calculateQueue[i],
					newSize = this.getElSize(observable.node);

				if (observable.height === undefined) {
					this.setInitialSize(observable, newSize);
					continue;
				}

				this.onElementResize(observable, newSize);
			}

			this.calculateQueue = [];

		}, {label: $$.calculateSize});
	}

	/**
	 * Returns true if the observable callback should be executed
	 *
	 * @param observable
	 * @param newSize
	 */
	protected shouldCallCallback(observable: Observable, newSize: Size): boolean {
		const {
			watchWidth,
			watchHeight,
			width,
			height
		} = observable;

		const {
			width: newWidth,
			height: newHeight
		} = newSize;

		let
			res = false;

		if (watchWidth) {
			res = width !== newWidth;
		}

		if (watchHeight && !res) {
			res = height !== newHeight;
		}

		return res;
	}

	/**
	 * Returns a size of the specified element
	 * @param el
	 */
	protected getElSize(el: HTMLElement): Size {
		return {
			width: el.clientWidth,
			height: el.clientHeight
		};
	}

	/**
	 * Initializes a resize event listener
	 */
	protected initResizeEvent(): void {
		const
			{async: $a} = this;

		$a.on(window, 'resize', () => {
			$a.requestIdleCallback(() => {
				this.calculateQueue = Array.from(this.elements, (v) => v[1]);
				this.calculate();

			}, {label: $$.callSubscribers, join: true});
		}, {label: $$.resize});
	}

	/**
	 * Handler: element was resized
	 *
	 * @param observable
	 * @param newSize
	 */
	protected onElementResize(observable: Observable, newSize: Size): void {
		const oldSize = {
			width: observable.width!,
			height: observable.height!
		};

		if (this.shouldCallCallback(observable, newSize)) {
			observable.callback(observable, newSize, oldSize);
		}

		Object.assign(observable, newSize);
	}
}
