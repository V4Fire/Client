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
	root?: (() => HTMLElement) | HTMLElement;

	/**
	 * Should count view of an element
	 */
	count?: (() => boolean) | boolean;

	/**
	 * Callback that will be executed after the delay
	 */
	callback?: Function;

	/**
	 * Delay before callback execution
	 * @see https://w3c.github.io/IntersectionObserver/v2/#dom-intersectionobserver-delay
	 */
	delay?: number;

	/**
	 * How an element should be deactivated after he was seen (only if once is set to true)
	 *
	 *   *) remove - element will be removed from inView directive
	 *
	 *   *) deactivate - element will not be removed from inView directive: he will be deactivated after was seen
	 *      (you can activate the specified element later, and he will become observable again)
	 */
	removeStrategy?: RemoveStrategy;

	/**
	 * Only for environments that doesn't support intersection observer.
	 *
	 * If true, the element will not be placed in the position map;
	 * instead, the method of polling the positions of the elements will be used.
	 * Every 75 milliseconds each observable elements will be asked about its position using getBoundingClientRect
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
	root?: (() => HTMLElement) | HTMLElement;

	/**
	 * Notice: Compute of visibility is more expensive than intersection. For that reason,
	 * Intersection Observer v2 is not intended to be used broadly in the way that Intersection Observer v1 is.
	 * Intersection Observer v2 is focused on combatting fraud and should be used only when
	 * Intersection Observer v1 functionality is truly insufficient.
	 */
	trackVisibility?: boolean;
}

export interface DirectiveOptions extends VNodeDirective {
	modifiers?: {
		[key: string]: boolean;
	};

	value?: CanArray<InitOptions>;
}

export type RemoveStrategy = 'remove' | 'deactivate';
export type InitOptions = ObserveOptions & IntersectionObserverOptions;
export type ObservableElementsMap = Map<HTMLElement, ObservableElement>;
export type ObservableThresholdMap = Map<number, ObservableElement>;
export type ObservableElementsThresholdMap = Map<HTMLElement, ObservableThresholdMap>;
export type ObservableElementRect = ElementRect & {observable: ObservableElement};
export type ObservableElement = Observable & InitOptions;
