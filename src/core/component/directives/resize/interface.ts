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

	value?: ObservableCallback | DirectiveOptionsValue;
}

export interface DirectiveOptionsValue {
	/**
	 * If true, when changing the width of the element, a callback will be called
	 */
	watchWidth?: boolean;

	/**
	 * If true, when changing the height of the element, a callback will be called
	 */
	watchHeight?: boolean;

	/**
	 * Callback which will be executed when changing the width or height of the element
	 *
	 * @param observable
	 * @param oldSize
	 * @param newSize
	 */
	callback: ObservableCallback;
}

export interface Observable extends DirectiveOptionsValue {
	node: HTMLElement;
	observer?: ResizeObserver;
	width?: number;
	height?: number;
}

export interface Size {
	width: number;
	height: number;
}

export type ObservableCallback = (observable: Observable, oldSize: Size, newSize: Size) => unknown;
