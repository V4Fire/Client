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
	 * If true, when changing the element width, a callback will be executed
	 */
	watchWidth?: boolean;

	/**
	 * If true, when changing the element height, a callback will be executed
	 */
	watchHeight?: boolean;

	/**
	 * Callback that will be called if the element size has been changed
	 *
	 * @param observable
	 * @param oldSize
	 * @param newSize
	 */
	callback: ObserverCb;
}

export interface Observable extends ObserverOptions {
	node: HTMLElement;
	observer?: ResizeObserver;
	width?: number;
	height?: number;
}

export interface Size {
	width: number;
	height: number;
}

export type ObserverCb = (observable: Observable, oldSize: Size, newSize: Size) => unknown;
