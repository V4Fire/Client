/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * API for retrieving and monitoring the system's visual appearance.
 */
export interface SystemThemeExtractor {
	/**
	 * Retrieves the current system visual appearance theme.
	 */
	getSystemTheme(): PromiseLike<string>;

	/**
	 * Initializes an event listener for changes in the system's visual appearance theme.
	 *
	 * @param cb - A callback function to be invoked when the theme changes.
	 *             It receives the color scheme identifier as a string parameter by which project theme can be selected
	 */
	subscribe(cb: (value: string) => void): void;

	/**
	 * Terminates the event listener for changes in the system's visual appearance theme.
	 */
	unsubscribe(): void;
}
