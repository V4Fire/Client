/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { VNodeDirective } from 'core/component/engines';

export interface DirectiveOptions extends VNodeDirective {
	modifiers: {
		[key: string]: boolean;
	};

	value?: ObserverCb | ObserverOptions;
}

export interface ObserverOptions {
	/**
	 * If `true`, when changing the element width, a callback will be executed
	 * @default `true`
	 */
	watchWidth?: boolean;

	/**
	 * If `true`, when changing the element height, a callback will be executed
	 * @default `true`
	 */
	watchHeight?: boolean;

	/**
	 * If `true`, then the callback is invoked immediately after the initializing of the module
	 * @default `true`
	 */
	initial?: boolean;

	/**
	 * If `true`, then the callback is invoked immediately after the size has been changed.
	 *
	 * Be careful with setting this option to `true`, as if an element is resized multiple times in a row,
	 * a callback will be called for each change
	 */
	immediate?: boolean;

	/** @see ObserverCb */
	callback: ObserverCb;
}

export interface Observable extends ObserverOptions {
	node: HTMLElement;
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
export type ObserverCb = (
	observable: Required<Observable>,
	newRect: DOMRectReadOnly,
	oldRect?: DOMRectReadOnly
) => unknown;
