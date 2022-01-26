/**
 * Options for functions `waitForEl` like
 */
export interface WaitForElOptions {
	/**
	 * The delay between trying to find an element on a page
	 * @default `100`
	 */
	sleep?: number;

	/**
	 * Time after which the function stops trying to find an element on a page and returns `undefined`
	 * @default `3500`
	 */
	timeout?: number;

	/**
	 * Event to wait
	 *
	 *  * `mount` – element attached to a page
	 *  * `unmount` – element detached from a page
	 *
	 * @default `mount`
	 */
	to?: 'mount' | 'unmount';
}
