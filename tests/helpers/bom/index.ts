/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import delay from 'delay';

import type { Page } from 'playwright';

import type { WaitForIdleOptions, WaitForRAFOptions } from 'tests/helpers/bom/interface';

export * from 'tests/helpers/bom/interface';

/**
 * Class provides API to work with BOM (browser object model)
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class BOM {

	/**
	 * Creates a {@link PerformanceObserver} that monitors the CLS metric while fn is executed,
	 * and returns the sum of the value of all {@link PerformanceEntry PerformanceEntries}.
	 *
	 * @param page
	 * @param fn
	 * @param [waitForIdle]
	 */
	static async clsScore(page: Page, fn: Function, waitForIdle: boolean = true): Promise<number> {
		interface ObserverData {
			score: number;
			observer: PerformanceObserver;
		}

		const uniqId = Math.random().toString();

		await page.evaluate(([uniqId]) => {
			const data: ObserverData = {
				score: 0,
				observer: new PerformanceObserver((list) => {
					for (const entry of list.getEntries()) {
						data.score += Object.cast<{value: number}>(entry).value;
					}
				})
			};

			globalThis[uniqId] = data;
			data.observer.observe({type: 'layout-shift'});

		}, [uniqId]);

		await fn();

		if (waitForIdle) {
			await this.waitForIdleCallback(page, {sleepAfterIdles: 0});
		}

		return page.evaluate(([uniqId]) => {
			const data: ObserverData = globalThis[uniqId];

			data.observer.takeRecords();
			data.observer.disconnect();

			return data.score;
		}, [uniqId]);
	}

	/**
	 * Returns a promise that will be resolved when the passed page process is switched to idle
	 *
	 * @param page
	 * @param [idleOpts]
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

		} catch {}

		await delay(normalizedIdleOptions.sleepAfterIdles);
	}

	/**
	 * Waits until `requestAnimationFrame` fires on the page
	 *
	 * @param page
	 * @param [rafOpts]
	 */
	static async waitForRAF(page: Page, rafOpts: WaitForRAFOptions = {}): Promise<void> {
		const normalizedRafOptions = <Required<WaitForRAFOptions>>{
			waitForRafTimes: 1,
			sleepAfterRAF: 100,
			...rafOpts
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
