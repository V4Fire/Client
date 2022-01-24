/**
 * `waitForIdleCallback` function options
 */
export interface WaitForIdleOptions {
	/**
	 * Indicates the number of `requestIdleCallback` that should occur
	 * @default `1`
	 */
	waitForIdleTimes?: number;

	/**
	 * Delay before exiting the function
	 * @default `100`
	 */
	sleepAfterIdles?: number;
}

/**
 * `waitForRAF` function options
 */
export interface WaitForRAFOptions {
	/**
	 * Indicates the number of `requestAnimationFrame` that should occur
	 * @default `1`
	 */
	waitForRafTimes?: number;

	/**
	 * Delay before exiting the function
	 * @default `100`
	 */
	sleepAfterRAF?: number;
}
