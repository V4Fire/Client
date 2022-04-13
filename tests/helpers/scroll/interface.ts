/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface ScrollToBottomWhileOptions extends ScrollOptions {
	/**
	 * Timeout after which the function is forced to finish execution
	 * @default `1000`
	 */
	timeout?: number;

	/**
	 * Number of milliseconds between attempts to scroll down the page
	 * @default `100`
	 */
	tick?: number;
}
