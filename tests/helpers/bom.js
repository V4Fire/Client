// @ts-check

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	delay = require('delay');

/**
 * @typedef {import('playwright').Page} Page
 * @typedef {import('playwright').BrowserContext} BrowserContext
 * @typedef {import('playwright').ElementHandle} ElementHandle
 */

/**
 * Class provides API to work with `BOM` (browser object model)
 */
class BOM {
	/**
	 * @param {BrowserTests.Helpers} parent
	 */
	constructor(parent) {
		this.#parent = parent;
	}

	/**
	 * @see [[BrowserTests.BOM.waitForIdleCallback]]
	 */
	async waitForIdleCallback(page, idleOptions = {}) {
		idleOptions = {
			waitForIdleTimes: 1,
			sleepAfterIdles: 100,
			...idleOptions
		};

		try {
			await page.evaluate((opts) => new Promise(async (res) => {
				const waitForIdle = () => new Promise((res) => {
					if (typeof requestIdleCallback !== 'undefined') {
						requestIdleCallback(() => res());

					} else {
						setTimeout(res, 50);
					}
				});

				while (opts.waitForIdleTimes) {
					await waitForIdle();
					opts.waitForIdleTimes--;
				}

				res();

			}), idleOptions);
		} catch {}

		await delay(idleOptions.sleepAfterIdles);
	}

	/**
	 * @see [[BrowserTests.BOM.waitForRAF]]
	 */
	async waitForRAF(page, rafOptions = {}) {
		rafOptions = {
			waitForRafTimes: 1,
			sleepAfterRAF: 100,
			...rafOptions
		};

		try {
			await page.evaluate((opts) => new Promise(async (res) => {
				const waitForRAF = () => new Promise((res) => {
					requestAnimationFrame(res);
				});

				while (opts.waitForRafTimes) {
					await waitForRAF();
					opts.waitForRafTimes--;
				}

				res();

			}), rafOptions);
		} catch {}

		await delay(rafOptions.sleepAfterRAF);
	}

	/**
	 * Parent class
	 * @type  {BrowserTests.Helpers}
	 */
	#parent;
}

module.exports = BOM;
