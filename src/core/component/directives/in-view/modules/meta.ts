/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { VNodeDirective } from 'core/component/engines';

export interface Observable {
	node: HTMLElement;
	isLeaving: boolean;
	isDeactivated: boolean;
	id: string;
}

export interface ObserveOptions {
	callback: Function;
	count?: Function | boolean;
	group?: string;
	once?: boolean;
	timeout?: number;
	startObserveCondition?: Function;
	handleTransitionEnd?: boolean;

	/**
	 * May slowdown your app performance.
	 * Use it carefully
	 */
	polling?: boolean;

	/**
	 * Element will become observable after function will be resolved and returns true
	 */
	wait?(): boolean;
}

export interface ElementRect {
	top: number;
	left: number;
	bottom: number;
	right: number;
	width: number;
	height: number;
}

export interface IntersectionObserverOptions {
	threshold: number;
}

export interface DirectiveOptions extends VNodeDirective {
	modifiers?: {
		[key: string]: boolean;
	};

	value?: ObserveOptions & {threshold?: number} | Function;
}

export type ObservableElementsMap = Map<HTMLElement, ObservableElement>;
export type ObservableElementRect = ElementRect & {observable: ObservableElement};
export type ObservableElement = Observable & ObserveOptions & IntersectionObserverOptions;
