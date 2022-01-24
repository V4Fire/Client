/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { VNodeDirective } from '@src/core/component/engines';

import type MutationObserverStrategy from '@src/core/dom/in-view/mutation';
import type IntersectionObserverStrategy from '@src/core/dom/in-view/intersection';

/**
 * @deprecated
 * @see [[InViewObservable]]
 */
export type Observable = InViewObservable;

export interface InViewObservable {
	id: string;
	node: Element;
	size: InViewObservableElSize;
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

/**
 * @deprecated
 * @see [[InViewObservableElSize]]
 */
export type Size = InViewObservableElSize;

export interface InViewObservableElSize {
	width: number;
	height: number;
}

/**
 * @deprecated
 * @see [[InViewObserveOptions]]
 */
export type ObserveOptions = InViewObserveOptions;

export interface InViewObserveOptions {
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
	 * Notice: May slow your app performance, use it carefully.
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
	callback?(observable: InViewObservableElement): unknown;

	/**
	 * Handler: element enters the viewport
	 * @param observable
	 */
	onEnter?(observable: InViewObservableElement): unknown;

	/**
	 * Handler: element leaves the viewport
	 * @param observable
	 */
	onLeave?(observable: InViewObservableElement): unknown;
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
	 * Intersection Observer v2 is focused on combating fraud and should be used only when
	 * Intersection Observer v1 functionality is truly insufficient.
	 */
	trackVisibility?: boolean;
}

/**
 * @deprecated
 * @see [[InViewDirectiveOptions]]
 */
export type DirectiveOptions = InViewDirectiveOptions;

export interface InViewDirectiveOptions extends VNodeDirective {
	modifiers?: {
		[key: string]: boolean;
	};

	value?: CanArray<InViewInitOptions>;
}

/**
 * @deprecated
 * @see [[InViewUnobserveOptions]]
 */
export type UnobserveOptions = InViewUnobserveOptions;

export interface InViewUnobserveOptions {
	/**
	 * Threshold of an element to unobserve
	 */
	threshold?: number;

	/**
	 * If true, the element will not be removed completely,
	 * later it will be possible to resume tracking the element using `unsuspend` method.
	 */
	suspend?: boolean;
}

/**
 * Suspended observable elements
 * [group name]:[observable[]]
 */
export type InViewObservableByGroup = Map<InViewGroup, Set<InViewObservableElement>>;

/**
 * @deprecated
 * @see [[InViewObservableByGroup]]
 */
export type ObservablesByGroup = InViewObservableByGroup;

export type InViewAdapteeType = 'mutation' | 'observer';
export type InViewAdapteeInstance = typeof MutationObserverStrategy | typeof IntersectionObserverStrategy;

export type InViewGroup = string | number | symbol;
export type InViewObservablesByGroup = Map<InViewGroup, Map<Element, Map<number, InViewObservableElement>>>;
export type InViewInitOptions = InViewObserveOptions & IntersectionObserverOptions;

export type InViewObservableElementsMap = Map<Element, InViewObservableElement>;
export type InViewObservableThresholdMap = Map<number, InViewObservableElement>;
export type InViewObservableElementsThresholdMap = Map<Element, InViewObservableThresholdMap>;
export type InViewObservableElementRect = ElementRect & {observable: InViewObservableElement};
export type InViewObservableElement = InViewObservable & InViewInitOptions;

/**
 * @deprecated
 * @see [[InViewAdapteeType]]
 */
export type AdapteeType = InViewAdapteeType;

/**
 * @deprecated
 * @see [[InViewAdapteeInstance]]
 */
export type AdapteeInstance = InViewAdapteeInstance;

/**
 * @deprecated
 * @see [[InViewInitOptions]]
 */
export type InitOptions = InViewInitOptions;

/**
 * @deprecated
 * @see [[InViewObservableElementsMap]]
 */
export type ObservableElementsMap = InViewObservableElementsMap;

/**
 * @deprecated
 * @see [[InViewObservableThresholdMap]]
 */
export type ObservableThresholdMap = InViewObservableThresholdMap;

/**
 * @deprecated
 * @see [[InViewObservableElementsThresholdMap]]
 */
export type ObservableElementsThresholdMap = InViewObservableElementsThresholdMap;

/**
 * @deprecated
 * @see [[InViewObservableElementRect]]
 */
export type ObservableElementRect = InViewObservableElementRect;

/**
 * @deprecated
 * @see [[InViewObservableElement]]
 */
export type ObservableElement = InViewObservableElement;
