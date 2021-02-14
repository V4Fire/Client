/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { VNodeDirective } from 'core/component/engines';

import MutationObserverStrategy from 'core/dom/in-view/mutation';
import IntersectionObserverStrategy from 'core/dom/in-view/intersection';

export interface Observable {
	id: string;
	node: Element;
	size: Size;
	isLeaving: boolean;

	/**
	 * Indicates the time at which the element enters the viewport relative to the document creation
	 */
	timeIn?: DOMHighResTimeStamp;

	/**
	 * Indicates the time at which the element leaves the viewport relative to the document creation
	 */
	timeOut?: DOMHighResTimeStamp;

	/**
	 * Last recorded time from entry
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry/time
	 */
	time?: DOMHighResTimeStamp;
}

export interface Size {
	width: number;
	height: number;
}

export interface ObserveOptions {
	group?: InViewGroup;
	once?: boolean;
	handleTransitionEnd?: boolean;
	root?: (() => Element) | Element;

	/**
	 * Should count view of an element
	 */
	count?: (() => boolean) | boolean;

	/**
	 * Delay before callback execution
	 */
	delay?: number;

	/**
	 * Only for environments that don't support intersection observer.
	 *
	 * If true, the element won't be placed in the position map;
	 * instead, the method of polling the positions of the elements will be used.
	 * Every 75 milliseconds each observable elements will be asked about its position by using getBoundingClientRect.
	 *
	 * Notice: May slowdown your app performance, use it carefully.
	 */
	polling?: boolean;

	/**
	 * If defined, then an element will become observable only after the function returns true
	 */
	wait?(): boolean;

	/**
	 * Callback that is invoked after the delay
	 * @param observable
	 */
	callback?(observable: ObservableElement): unknown;

	/**
	 * Handler: element enters the viewport
	 * @param observable
	 */
	onEnter?(observable: ObservableElement): unknown;

	/**
	 * Handler: element leaves the viewport
	 * @param observable
	 */
	onLeave?(observable: ObservableElement): unknown;
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
	root?: (() => Element) | Element;

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

export interface UnobserveOptions {
	/**
	 * Threshold of an element to unobserve
	 */
	threshold?: number;

	/**
	 * If true then the element will not be removed completely,
	 * later it will be possible to resume tracking the element using `unsuspend` method.
	 */
	suspend?: boolean;
}

/**
 * Suspended observable elements
 * [group name]:[observable[]]
 */
export type ObservablesByGroup = Map<InViewGroup, Set<ObservableElement>>;

export type AdapteeType = 'mutation' | 'observer';
export type AdapteeInstance = typeof MutationObserverStrategy | typeof IntersectionObserverStrategy;

export type InViewGroup = string | number | symbol;
export type InitOptions = ObserveOptions & IntersectionObserverOptions;

export type ObservableElementsMap = Map<Element, ObservableElement>;
export type ObservableThresholdMap = Map<number, ObservableElement>;
export type ObservableElementsThresholdMap = Map<Element, ObservableThresholdMap>;
export type ObservableElementRect = ElementRect & {observable: ObservableElement};
export type ObservableElement = Observable & InitOptions;
