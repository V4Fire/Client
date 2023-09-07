/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface WatchOptions {
	/**
	 * This property allows you to specify the box model that is used to determine size changes:
	 *
	 * 1. The `content-box` option includes only the actual content of the element.
	 * 2. The `border-box` option takes into account changes in `border` and `padding`.
	 * 3. The `device-pixel-content-box` option is similar to `content-box`,
	 *    but it also considers the actual pixel size of the device it is rendering to.
	 *    This means that `device-pixel-content-box` will change at a different rate than content-box depending on
	 *    the pixel density of the device.
	 *
	 * @default `'content-box'`
	 */
	box?: ResizeObserverBoxOptions;

	/**
	 * If set to false, then the handler won't be called when only the width of the observed element changes
	 * @default `true`
	 */
	watchWidth?: boolean;

	/**
	 * If set to false, then the handler won't be called when only the height of the observed element changes
	 * @default `true`
	 */
	watchHeight?: boolean;

	/**
	 * If set to true, then the handler will be called after the first resizing
	 * @default `true`
	 */
	watchInit?: boolean;

	/**
	 * If set to true, the handler will be called immediately when the size of the observed element changes.
	 * However, it's important to exercise caution when using this option,
	 * as it can potentially degrade the performance of your application.
	 *
	 * @default `false`
	 */
	immediate?: boolean;

	/**
	 * If set to true, after the first handler is invoked, the observation of the element will be canceled.
	 * It's important to note that the handler firing caused by the `watchInit` option will be ignored in this case.
	 *
	 * @default `false`
	 */
	once?: boolean;
}

export interface Watcher extends Readonly<
	WatchOptions &
	Required<Pick<WatchOptions, 'watchWidth' | 'watchHeight' | 'immediate' | 'watchInit' | 'once'>>
> {
	/**
	 * The unique watcher identifier
	 */
	readonly id: string;

	/**
	 * The observed element
	 */
	readonly target: Element;

	/**
	 * A function that will be called when the observable element is resized
	 */
	readonly handler: WatchHandler;

	/**
	 * The observable element geometry
	 */
	readonly rect?: DOMRectReadOnly;

	/**
	 * Observable element `boxSize`.
	 * Less browser support than DOMRectReadOnly.
	 */
	readonly boxSize?: readonly ResizeObserverSize[];

	/**
	 * Cancels watching for the element geometry
	 */
	unwatch(): void;
}

/**
 * A function that will be called when the observable element is resized
 *
 * @param newRect - the new element geometry
 * @param oldRect - the old element geometry
 * @param watcher - the element watcher
 */
export interface WatchHandler {
	(
		newRect: DOMRectReadOnly,
		oldRect: CanUndef<DOMRectReadOnly>,
		watcher: Watcher
	): void;
}

export type ObservableElements = Map<Element, Map<WatchHandler, Writable<Watcher>>>;
