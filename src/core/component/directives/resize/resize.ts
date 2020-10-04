/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import Async from 'core/async';

import { ObserverOptions, Observable } from 'core/component/directives/resize/interface';

export const
	$$ = symbolGenerator();

export default class Resize {
	/**
	 * True if the environment supports ResizeObserver
	 */
	get isResizeObserverSupported(): boolean {
		return 'ResizeObserver' in globalThis;
	}

	/**
	 * Map of observable elements
	 */
	protected elements: Map<Element, Observable> = new Map();

	/**
	 * Async instance
	 */
	// eslint-disable-next-line @typescript-eslint/no-invalid-this
	protected async: Async<this> = new Async(this);

	/**
	 * Starts to observe resizing of the specified element
	 *
	 * @param el
	 * @param params
	 */
	observe(el: HTMLElement, params: ObserverOptions): boolean {
		if (this.elements.has(el) || this.isResizeObserverSupported) {
			return false;
		}

		const
			observable = this.createObservable(el, params);

		this.createResizeObserver(observable);
		this.elements.set(el, observable);

		return true;
	}

	/**
	 * Stops to observe resizing of the specified element
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
			observer?.disconnect();
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
		observable.observer = new ResizeObserver(([{contentRect}]) => {
			if (observable.rect === undefined) {
				this.setInitialSize(observable, contentRect);
				return;
			}

			this.onElementResize(observable, contentRect);
		});

		observable.observer.observe(observable.node);
	}

	/**
	 * Sets an initial size of the specified observable
	 *
	 * @param observable
	 * @param newRect
	 */
	protected setInitialSize(observable: Observable, newRect: DOMRectReadOnly): void {
		observable.rect = newRect;

		if (observable.initial) {
			observable.callback(<Required<Observable>>observable, newRect);
		}
	}

	/**
	 * Returns true if the observable callback should be executed
	 *
	 * @param observable
	 * @param newRect
	 */
	protected shouldInvokeCallback(observable: Observable, newRect: DOMRectReadOnly): boolean {
		const {
			watchWidth,
			watchHeight,
			rect: oldRect
		} = observable;

		if (oldRect == null) {
			return true;
		}

		const {
			width: oldWidth,
			height: oldHeight
		} = oldRect;

		const {
			width: newWidth,
			height: newHeight
		} = newRect;

		let
			res = false;

		if (watchWidth) {
			res = oldWidth !== newWidth;
		}

		if (watchHeight && !res) {
			res = oldHeight !== newHeight;
		}

		return res;
	}

	/**
	 * Handler: element was resized
	 *
	 * @param observable
	 * @param newRect
	 */
	protected onElementResize(observable: Observable, newRect: DOMRectReadOnly): void {
		const oldRect = observable.rect;

		if (this.shouldInvokeCallback(observable, newRect)) {
			observable.callback(<Required<Observable>>observable, newRect, oldRect);
		}

		observable.rect = newRect;
	}
}
