/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ComponentInterface } from 'core/component';

export interface ResizeWatcherObserverOptions {
	/**
	 * If `true`, when changing an element width, the callback will be executed
	 * @default `true`
	 */
	watchWidth?: boolean;

	/**
	 * If `true`, when changing an element height, the callback will be executed
	 * @default `true`
	 */
	watchHeight?: boolean;

	/**
	 * If `true`, then the callback is invoked immediately after the module initializing
	 * @default `true`
	 */
	initial?: boolean;

	/**
	 * If `true`, then the callback is invoked immediately after any changes of the element size.
	 *
	 * Be careful with setting this option to `true`,  the callback will be called for each changing of the size.
	 *
	 * @default `false`
	 */
	immediate?: boolean;

	/**
	 * If true, the watcher would be automatically removed when invoked (initial call does not count)
	 * @default `false`
	 */
	once?: boolean;

	/**
	 * Execution context.
	 *
	 * The context is used to provide a component environment, like, async, event emitters, etc.
	 * When API is used as a directive, the context will automatically taken from a VNode instance.
	 *
	 * Using a `callback` option without the context provided can lead to unexpected results.
	 *
	 * @example
	 * ```typescript
	 * class Test {
	 *   setImageToDiv() {
	 *     ResizeWatcher.observer(this.$refs.div, {ctx: this, callback: (v) => console.log(v)})
	 *   }
	 * }
	 * ```
	 */
	ctx?: ComponentInterface;

	/** @see [[ResizeWatcherObserverCb]] */
	callback: ResizeWatcherObserverCb;
}

export interface ResizeWatcherObservable extends ResizeWatcherObserverOptions {
	node: Element;
	id: string;
	destructor: Function;
	rect?: DOMRectReadOnly;
	observer?: ResizeObserver;
}

/**
 * Callback that is invoked if an element size has been changed
 *
 * @param observable
 * @param newRect
 * @param [oldRect]
 */
export type ResizeWatcherObserverCb = (
	observable: Readonly<Required<ResizeWatcherObservable>>,
	newRect: DOMRectReadOnly,
	oldRect?: DOMRectReadOnly
) => unknown;

export type ResizeWatcherInitOptions = ResizeWatcherObserverOptions | ResizeWatcherObserverCb;
export type ResizeWatcherObservableElStore = Map<ResizeWatcherObserverCb, ResizeWatcherObservable>;
