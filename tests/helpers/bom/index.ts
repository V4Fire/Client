/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import delay from 'delay';

import type { Page } from 'playwright';

import type { WaitForIdleOptions } from 'tests/helpers/bom/interface';

export * from 'tests/helpers/bom/interface';

/**
 * Class provides API to work with BOM (browser object model)
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class BOM {
	/**
	 * Waits until the passed page process shift to an idle state, then it resolves a promise.
	 *
	 * @param page
	 * @param [idleOpts] - Optional parameter containing the configurations for the idle state.
	 * @param [idleOpts.waitForIdleTimes] - The number of times the page should wait for idleness. The default value is 1.
	 * @param [idleOpts.sleepAfterIdles] - The time in millisecond the page should sleep after idle. Default is 100ms.
	 *
	 * @returns - A promise that gets resolved when the page process switches to idle.
	 *
	 * @example
	 * ```typescript
	 * // Waits for the page to become idle once and sleeps for 100ms after that.
	 * await BOM.waitForIdleCallback(page);
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Waits for the page to become idle three times with a 500ms sleep after idle state.
	 * const customIdleOpts = {
	 *   waitForIdleTimes: 3,
	 *   sleepAfterIdles: 500
	 * };
	 *
	 * await BOM.waitForIdleCallback(page, customIdleOpts);
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Waits for the page to become idle two times with the default 100ms sleep after idle state.
	 * const idleOptsWithWaitTimes = {
	 *   waitForIdleTimes: 2
	 * };
	 *
	 * await BOM.waitForIdleCallback(page, idleOptsWithWaitTimes);
	 * ```
	 */
	static async waitForIdleCallback(page: Page, idleOpts: WaitForIdleOptions = {}): Promise<void> {
		const normalizedIdleOptions = <Required<WaitForIdleOptions>>{
			waitForIdleTimes: 1,
			sleepAfterIdles: 100,
			...idleOpts
		};

		try {
			await page.evaluate((normalizedIdleOptions) => new Promise<void>(async (res) => {
				const waitForIdle = () => new Promise<void>((res) => {
					if (typeof requestIdleCallback !== 'undefined') {
						requestIdleCallback(() => res());

					} else {
						setTimeout(res, 50);
					}
				});

				while (normalizedIdleOptions.waitForIdleTimes > 0) {
					await waitForIdle();
					normalizedIdleOptions.waitForIdleTimes--;
				}

				res();

			}), normalizedIdleOptions);

		} catch { }

		await delay(normalizedIdleOptions.sleepAfterIdles);
	}
}
