/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import delay from 'delay';

import type { Page } from 'playwright';

import type Helpers from '@tests/helpers';
import type { WaitForIdleOptions, WaitForRAFOptions } from '@tests/helpers/bom/interface';

export * from '@tests/helpers/bom/interface';

/**
 * Class provides API to work with `BOM` (browser object model)
 */
export default class BOM {

	/** @see [[Helpers]] */
	protected parent: typeof Helpers;

	/** @param parent */
	constructor(parent: typeof Helpers) {
		this.parent = parent;
	}

	/**
	 * Waits until `requestIdleCallback` (`setTimeout 50` for safari) on the page
	 *
	 * @param page
	 * @param [idleOptions]
	 */
	async waitForIdleCallback(page: Page, idleOptions: WaitForIdleOptions = {}): Promise<void> {
		const normalizedIdleOptions = <Required<WaitForIdleOptions>>{
			waitForIdleTimes: 1,
			sleepAfterIdles: 100,
			...idleOptions
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

		} catch {}

		await delay(normalizedIdleOptions.sleepAfterIdles);
	}

	/**
	 * Waits until `requestAnimationFrame` fires on the page
	 *
	 * @param page
	 * @param [rafOptions]
	 */
	async waitForRAF(page: Page, rafOptions: WaitForRAFOptions = {}): Promise<void> {
		const normalizedRafOptions = <Required<WaitForRAFOptions>>{
			waitForRafTimes: 1,
			sleepAfterRAF: 100,
			...rafOptions
		};

		try {
			await page.evaluate((normalizedRafOptions) => new Promise<void>(async (res) => {
				const waitForRAF = () => new Promise((res) => {
					requestAnimationFrame(res);
				});

				while (normalizedRafOptions.waitForRafTimes > 0) {
					await waitForRAF();
					normalizedRafOptions.waitForRafTimes--;
				}

				res();

			}), normalizedRafOptions);

		} catch {}

		await delay(normalizedRafOptions.sleepAfterRAF);
	}
}
