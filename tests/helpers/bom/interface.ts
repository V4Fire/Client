/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface WaitForIdleOptions {
	/**
	 * Indicates the number of `requestIdleCallback` that should occur
	 * @default `1`
	 */
	waitForIdleTimes?: number;

	/**
	 * Delay before resolving the function promise
	 * @default `100`
	 */
	sleepAfterIdles?: number;
}

export interface WaitForRAFOptions {
	/**
	 * Indicates the number of `requestAnimationFrame` that should occur
	 * @default `1`
	 */
	waitForRafTimes?: number;

	/**
	 * Delay before resolving the function promise
	 * @default `100`
	 */
	sleepAfterRAF?: number;
}
