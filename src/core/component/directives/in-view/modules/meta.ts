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
	onEnter?: Function;
	onLeave?: Function;
	group?: string;
	once?: boolean;
	handleTransitionEnd?: boolean;

	/**
	 * Should count view of element
	 */
	count?: (() => boolean) | boolean;

	/**
	 * Callback that will be executed after the delay
	 */
	callback?: Function;

	/**
	 * Delay before callback execution
	 */
	delay?: number;

	/**
	 * @deprecated use delay param instead, timeout will be removed in next major release
	 */
	timeout?: number;

	/**
	 * How an element should be deactivated after he was seen, only if once is set to true
	 *   *) remove - element will be removed from inView directive
	 *
	 *   *) deactivate - element will not be removed from inView directive, he will be deactivated after was seen,
	 *      you can activate specified element later, he will become observable again
	 */
	removeStrategy?: RemoveStrategy;

	/**
	 * Only for environments that do not support intersection observer.
	 *
	 * If set to true, the element will not be placed in the position map;
	 * instead, the method of polling the positions of the elements will be used.
	 * Every 75 milliseconds, each element being observed will be asked about its position using getBoundingClientRect
	 *
	 * Notice: May slowdown your app performance, use it carefully
	 */
	polling?: boolean;

	/**
	 * If defined, then an element will become observable only after the function returns true
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
	delay?: number;
	trackVisibility?: boolean;
}

export interface DirectiveOptions extends VNodeDirective {
	modifiers?: {
		[key: string]: boolean;
	};

	value?: ObserveOptions & {threshold?: number} | Function;
}

export type RemoveStrategy = 'remove' | 'deactivate';
export type InitOptions = ObserveOptions & IntersectionObserverOptions;
export type ObservableElementsMap = Map<HTMLElement, ObservableElement>;
export type ObservableElementRect = ElementRect & {observable: ObservableElement};
export type ObservableElement = Observable & ObserveOptions & IntersectionObserverOptions;
