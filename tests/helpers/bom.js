/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

const
	delay = require('delay');

/**
 * @typedef {import('playwright').Page} Page
 * @typedef {import('playwright').BrowserContext} BrowserContext
 * @typedef {import('playwright').ElementHandle} ElementHandle
 */

/**
 * Class provides API to work with `BOM`
 */
class BOM {

	/**
	 * @param {BrowserTests.Helpers} parent
	 */
	constructor(parent) {
		this.#parent = parent;
	}

	/**
	 * @param {Page} page
	 * @param {Object=} [idleOptions]
	 *
	 * @returns {!Promise<void>}
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
	 * Parent class
	 * @type  {BrowserTests.Helpers}
	 */
	#parent;
}

module.exports = BOM;
