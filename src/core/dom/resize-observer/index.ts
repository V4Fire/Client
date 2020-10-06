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

	ResizeWatcherObserverOptions,
	ResizeWatcherObservable,
	ResizeWatcherInitOptions,
	ResizeWatcherObservableElStore

} from 'core/dom/resize-observer/interface';

import { RESIZE_WATCHER_OBSERVABLE_STORE, RESIZE_WATCHER_ASYNC_GROUP } from 'core/dom/resize-observer/const';

export * from 'core/dom/resize-observer/interface';
export * from 'core/dom/resize-observer/const';

export const
	$$ = symbolGenerator();

export default class ResizeWatcher {
	/**
	 * True if the environment supports ResizeObserver
	 */
	get isResizeObserverSupported(): boolean {
		return 'ResizeObserver' in globalThis;
	}

	/**
	 * Async instance
	 */
	// eslint-disable-next-line @typescript-eslint/no-invalid-this
	protected async: Async<this> = new Async(this);

	/**
	 * Starts to observe resizing of the specified element
	 *
	 * @param el
	 * @param options
	 */
	observe(el: Element, options: ResizeWatcherInitOptions): Nullable<ResizeWatcherObservable> {
		options = this.normalizeOptions(options);

		if (this.isResizeObserverSupported === false) {
			return null;
		}

		if (this.isAlreadyBound(el, options)) {
			this.unobserve(el, options);
		}

		const
			observable = this.createObservable(el, options);

		this.saveObservableToElStore(observable);
		this.createResizeObserver(observable);

		return observable;
	}

	/**
	 * Stops to observe resizing of the specified element
	 *
	 * @param el
	 * @param options
	 */
	unobserve(el: Element, options: ResizeWatcherInitOptions): boolean {
		const
			store = this.getObservableElStore(el),
			callback = Object.isFunction(options) ? options : options.callback;

		if (!store) {
			return false;
		}

		const
			observable = store.get(callback);

		if (!observable) {
			return false;
		}

		store.delete(callback);
		observable.observer?.disconnect();

		const
			{ctx, id} = observable;

		if (ctx) {
			ctx.unsafe.async.clearAll({group: RESIZE_WATCHER_ASYNC_GROUP, label: id});
		}

		return true;
	}

	/**
	 * Removes all resize watcher from the specified element
	 * @param el
	 */
	clear(el: Element): void {
		const
			store = this.getObservableElStore(el);

		if (store == null) {
			return;
		}

		store.forEach((observable) => observable.destructor());
		store.clear();
	}

	/**
	 * Returns `true` if the specified element with the specified callback is already being observed
	 *
	 * @param el
	 * @param options
	 */
	isAlreadyBound(el: Element, options: ResizeWatcherInitOptions): boolean {
		const
			store = this.getObservableElStore(el),
			callback = Object.isFunction(options) ? options : options.callback;

		if (store == null) {
			return false;
		}

		return store.has(callback);
	}

	/**
	 * Stores an observable to the observable element store
	 * @param observable
	 */
	saveObservableToElStore(observable: ResizeWatcherObservable): void {
		this.getOrCreateObservableElStore(observable.node).set(observable.callback, observable);
	}

	/**
	 * Returns an observable store from the specified element
	 * @param el
	 */
	getObservableElStore(el: Element): CanUndef<ResizeWatcherObservableElStore> {
		const
			store = el[RESIZE_WATCHER_OBSERVABLE_STORE];

		return store;
	}

	/**
	 * Returns an observables store from the specified element; if it does not exist, it will be created and returned..
	 * @param el
	 */
	getOrCreateObservableElStore(el: Element): ResizeWatcherObservableElStore {
		return this.getObservableElStore(el) ?? (el[RESIZE_WATCHER_OBSERVABLE_STORE] = new Map());
	}

	/**
	 * Returns a normalized observable options
	 * @param options
	 */
	normalizeOptions(options: ResizeWatcherInitOptions): ResizeWatcherObserverOptions {
		const
			callback = Object.isFunction(options) ? options : options.callback;

		return {
			watchHeight: true,
			watchWidth: true,
			initial: true,
			immediate: false,
			once: false,
			...options,
			callback
		};
	}

	/**
	 * Creates a new observable element
	 *
	 * @param el
	 * @param options
	 */
	protected createObservable(el: Element, options: ResizeWatcherObserverOptions): ResizeWatcherObservable {
		return {
			node: el,
			id: String(Math.random()),
			destructor: () => this.unobserve(el, options),
			...options
		};
	}

	/**
	 * Creates an instance of ResizeObserver
	 * @param observable
	 */
	protected createResizeObserver(observable: ResizeWatcherObservable): void {
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
	protected setInitialSize(observable: ResizeWatcherObservable, newRect: DOMRectReadOnly): void {
		observable.rect = newRect;

		if (observable.initial) {
			observable.callback(<Required<ResizeWatcherObservable>>observable, newRect);
		}
	}

	/**
	 * Returns true if the observable callback should be executed
	 *
	 * @param observable
	 * @param newRect
	 * @param oldRect
	 */
	protected shouldInvokeCallback(
		observable: ResizeWatcherObservable,
		newRect: DOMRectReadOnly,
		oldRect: DOMRectReadOnly
	): boolean {
		const {
			watchWidth,
			watchHeight
		} = observable;

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
	protected onElementResize(observable: ResizeWatcherObservable, newRect: DOMRectReadOnly): void {
		const oldRect = observable.rect!;

		if (this.shouldInvokeCallback(observable, newRect, oldRect)) {
			const cb = () => {
				observable.callback(<Required<ResizeWatcherObservable>>observable, newRect, oldRect);

				if (observable.once) {
					observable.destructor();
				}
			};

			if (observable.immediate) {
				cb();

			} else {
				const $a = observable.ctx?.unsafe.async ?? this.async;
				$a.setTimeout(cb, 50, {group: RESIZE_WATCHER_ASYNC_GROUP, label: observable.id, join: false});
			}
		}

		observable.rect = newRect;
	}
}

const resizeWatcherInstance = new ResizeWatcher();
export { resizeWatcherInstance as ResizeWatcher };
