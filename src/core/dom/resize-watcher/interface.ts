/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface WatchOptions {
	/**
	 * This property allows you to change which box model is used to determine size changes.
	 *
	 * 1. The `content-box` option only includes the actual content of the element.
	 * 2. The `border-box` option takes into account things like border and padding changes.
	 * 3. The `device-pixel-content-box` option is similar to the `content-box` option, but it takes into account the
	 *    actual pixel size of the device it is rendering too. This means that the `device-pixel-content-box` will change
	 *    at a different rate than the `content-box` depending on the pixel density of the device.
	 *
	 * @default `'content-box'`
	 */
	box?: ResizeObserverBoxOptions;

	/**
	 * If false, then the handler won't be called when only the wight of the observed element changes
	 * @default `true`
	 */
	watchWidth?: boolean;

	/**
	 * If false, then the handler won't be called when only the height of the observed element changes
	 * @default `true`
	 */
	watchHeight?: boolean;

	/**
	 * If true, then the handler will be called immediately after the initialization of [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver).
	 * @default `true`
	 */
	watchInit?: boolean;

	/**
	 * If true, then the handler will be called immediately when the size of the observed element changes.
	 * Be careful using this option as it can degrade application performance.
	 *
	 * @default `false`
	 */
	immediate?: boolean;

	/**
	 * If true, then after the first handler firing, the observation of the element will be canceled.
	 * Note that the handler firing caused by the `watchInit` option is ignored.
	 *
	 * @default `false`
	 */
	once?: boolean;
}

export interface Watcher extends Readonly<WatchOptions> {
	/**
	 * The unique watcher identifier
	 */
	readonly id: string;

	/**
	 * The observed element
	 */
	readonly target: Element;

	/**
	 * The observable element geometry
	 */
	readonly rect?: DOMRectReadOnly;

	/**
	 * An instance of [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) that is used to
	 * observe the element
	 */
	readonly observer?: ResizeObserver;

	/**
	 * The operation destructor
	 */
	unwatch(): void;
}

/**
 * The function that will be called when the size of the observable element is changed
 *
 * @param newGeometry - the new element geometry
 * @param oldGeometry - the old element geometry
 * @param watcher - the element watcher
 */
export interface WatchHandler {
	(
		newGeometry: DOMRectReadOnly,
		oldGeometry: CanUndef<DOMRectReadOnly>,
		watcher: Watcher
	): void;
}
