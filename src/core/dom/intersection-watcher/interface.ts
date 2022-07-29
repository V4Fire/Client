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
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/root
	 */
	root?: Element | (() => Element);

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
	 * The minimum delay in milliseconds before calling the intersection handler.
	 * If after this delay the observable element leaves the viewport, then the intersection handler won't be called.
	 *
	 * @default `0`
	 */
	delay?: number;

	/**
	 * If true, then after the first intersection handler firing, the observation will be canceled
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
	 * If the handler returns false, then the main watcher handler won't be called.
	 * Note that this handler is always called immediately, i.e. ignores the `delay` option.
	 *
	 * @param watcher
	 */
	onEnter?(watcher: Watcher): AnyToBoolean;

	/**
	 * Handler: the observable element has leaved the viewport.
	 * Note that this handler is always called immediately, i.e. ignores the `delay` option.
	 *
	 * @param watcher
	 */
	onLeave?: WatchHandler;
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
	readonly root: Element;

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
