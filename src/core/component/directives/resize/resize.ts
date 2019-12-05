/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import symbolGenerator from 'core/symbol';

import { DirectiveOptionsValue, Observable, Size } from 'core/component/directives/resize/interface';

export const
	$$ = symbolGenerator();

export default class Resize {
	/**
	 * True if the environment supports `ResizeObserver` feature
	 */
	get hasResizeObserver(): boolean {
		return 'ResizeObserver' in globalThis;
	}

	/**
	 * Contains observable elements
	 */
	protected elementsObserverMap: Map<HTMLElement, Observable> = new Map();

	/**
	 * List of elements that are awaiting calculation size
	 *   *) only for environments that do not support `ResizeObserver`
	 */
	protected calculateQueue: Observable[] = [];

	/**
	 * Async instance
	 */
	protected async: Async<this> = new Async(this);

	constructor() {
		if (!this.hasResizeObserver) {
			this.registerResizeEvent();
		}
	}

	/**
	 * Deletes the specified element
	 * @param el
	 */
	delete(el: HTMLElement): boolean {
		const observable = this.elementsObserverMap.get(el);
		observable?.observer?.disconnect();
		return this.elementsObserverMap.delete(el);
	}

	/**
	 * Starts observe resize on the specified element
	 *
	 * @param el
	 * @param params
	 */
	observe(el: HTMLElement, params: DirectiveOptionsValue): boolean {
		if (this.elementsObserverMap.has(el)) {
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

		this.elementsObserverMap.set(el, observable);
		return true;
	}

	/**
	 * Clears all observers
	 */
	clear(): void {
		this.elementsObserverMap.forEach(({observer}) => {
			observer && observer.disconnect();
		});

		this.elementsObserverMap.clear();
	}

	/**
	 * Creates a new observable element
	 *
	 * @param el
	 * @param params
	 */
	protected createObservable(el: HTMLElement, params: DirectiveOptionsValue): Observable {
		return {
			node: el,
			...params
		};
	}

	/**
	 * Creates an instance of `ResizeObserver`
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
				Object.assign(observable, newSize);
				return;
			}

			this.onElementResize(observable, newSize);
		});

		observable.observer.observe(observable.node);
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
					Object.assign(observable, newSize);
					continue;
				}

				this.onElementResize(observable, newSize);
			}

			this.calculateQueue = [];

		}, {label: $$.calculateSize});
	}

	/**
	 * Returns true if an observable callback should be executed
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
	 * Returns height and width of the specified element
	 * @param el
	 */
	protected getElSize(el: HTMLElement): Size {
		return {
			width: el.clientWidth,
			height: el.clientHeight
		};
	}

	/**
	 * Registers a resize event
	 */
	protected registerResizeEvent(): void {
		const
			{async: $a} = this;

		$a.on(window, 'resize', () => {
			$a.requestIdleCallback(() => {
				this.calculateQueue = Array.from(this.elementsObserverMap, (v) => v[1]);
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
			observable.callback(observable, oldSize, newSize);
		}

		Object.assign(observable, newSize);
	}
}
