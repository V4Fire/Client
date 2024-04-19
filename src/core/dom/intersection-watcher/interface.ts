/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface WatchOptions {
	/**
	 * An element whose bounds are treated as the bounding box of the viewport for the element which is the
	 * observer target. This option can also be given as a function that returns the root element.
	 *
	 * Note, when using the heightmap-based watching strategy, this element will be used to calculate the geometry of
	 * the observed elements.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/root
	 */
	root?: Element | (() => Element);

	/**
	 * This option only affects the heightmap-based watching strategy and when the `root` option is passed.
	 * If set to false, registered event handlers will be called for every scroll event,
	 * including those not related to the root element.
	 *
	 * @default `true`
	 */
	onlyRoot?: boolean;

	/**
	 * A number which indicate at what percentage of the observable element visibility the intersection callback
	 * should be executed. If you only want to detect when visibility passes the 50% mark, you can use a value of `0.5`.
	 *
	 * The default is `0` (meaning as soon as even one pixel is visible, the handler will be run).
	 * A value of `1.0 `means that the threshold isn't considered passed until every pixel is visible.
	 *
	 * @default `0`
	 */
	threshold?: number;

	/**
	 * The minimum delay, in milliseconds, before calling the intersection handler.
	 * If the observable element leaves the viewport before this delay elapses,
	 * the intersection handler will not be called.
	 *
	 * @default `0`
	 */
	delay?: number;

	/**
	 * If set to true, then after the first intersection handler is called, the observation will be canceled
	 * @default `false`
	 */
	once?: boolean;

	/**
	 * A boolean indicating whether the watcher will track changes in the element visibility.
	 * This option is only meaningful for environments that support the native IntersectionObserver2 API.
	 *
	 * Mind, compute of visibility is more expensive than intersection.
	 * For that reason, IntersectionObserver2 is not intended to be used broadly in the way that IntersectionObserver1 is.
	 * IntersectionObserver2 is focused on combating fraud and should be used only when IntersectionObserver1
	 * functionality is truly insufficient.
	 *
	 * @see https://web.dev/intersectionobserver-v2
	 * @default `false`
	 */
	trackVisibility?: boolean;

	/**
	 * Handler: the observable element has entered the viewport.
	 * If the handler function returns false, the main watcher handler will not be called.
	 * It's important to note that this handler is always called immediately,
	 * meaning it ignores the delay option specified.
	 *
	 * @param watcher
	 */
	onEnter?(watcher: Watcher): AnyToBoolean;

	/**
	 * Handler: the observable element has left the viewport.
	 * It's important to note that this handler is always called immediately,
	 * meaning it ignores the delay option specified.
	 *
	 * @param watcher
	 */
	onLeave?: WatchHandler;

	/**
	 * A string, formatted similarly to the CSS margin property's value,
	 * which contains offsets for one or more sides of the root's bounding box.
	 * These offsets are added to the corresponding values in the root's bounding box
	 * before the intersection between the resulting rectangle and the target element's bounds.
	 * 
	 * Note: use this only for the `IntersectionObserver` strategy.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/rootMargin
	 */
	rootMargin?: string;
}

export interface Watcher extends Readonly<
	Omit<WatchOptions, 'root'> & Required<Pick<WatchOptions, 'once' | 'threshold' | 'delay'>>
> {
	/**
	 * The unique watcher identifier
	 */
	readonly id: string;

	/**
	 * An element whose bounds are treated as the bounding box of the viewport for the element which is the
	 * observer target
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/root
	 */
	readonly root?: Element;

	/**
	 * The observed element
	 */
	readonly target: Element;

	/**
	 * A function that will be called when the element enters the viewport
	 */
	readonly handler: WatchHandler;

	/**
	 * The observable target size
	 */
	readonly size: ElementSize;

	/**
	 * True if the observable target has left the viewport
	 */
	readonly isLeaving: boolean;

	/**
	 * The time the observed target entered the viewport relative to the time at which the document was created
	 */
	readonly timeIn?: DOMHighResTimeStamp;

	/**
	 * The time the observed target left the viewport relative to the time at which the document was created
	 */
	readonly timeOut?: DOMHighResTimeStamp;

	/**
	 * The time at which the observable target element experienced the intersection change.
	 * The time is specified in milliseconds since the creation of the containing document.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry/time
	 */
	readonly time?: DOMHighResTimeStamp;

	/**
	 * Cancels watching for the element intersection
	 */
	unwatch(): void;
}

export interface ElementSize {
	width: number;
	height: number;
}

/**
 * A link to the intersection watcher.
 * Can be given as a `threshold` value or a handler.
 */
export type WatchLink = WatchHandler | number;

/**
 * A function that will be called when the element enters the viewport
 * @param watcher - the element watcher
 */
export interface WatchHandler {
	(watcher: Watcher): void;
}
