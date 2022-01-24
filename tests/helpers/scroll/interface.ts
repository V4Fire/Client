export interface ScrollToBottomWhileOptions extends ScrollOptions {
	/**
	 * Timeout after which the function will complete execution
	 * @default `1000`
	 */
	timeout?: number;

	/**
	 * Number of milliseconds between attempts to scroll down the page
	 * @default `100`
	 */
	tick?: number;
}
