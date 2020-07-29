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
 */

class Utils {
	/**
	 * @param {BrowserTests.Helpers} parent
	 */
	constructor(parent) {
		this.#parent = parent;
	}

	/**
	 * @see [[BrowserTests.Utils.setup]]
	 */
	async setup(page, context, options) {
		options = {
			// eslint-disable-next-line quotes
			mocks: `['.*']`,
			permissions: ['geolocation'],
			location: {latitude: 59.95, longitude: 30.31667},
			sleepAfter: 2000,

			reload: true,

			waitForEl: undefined,

			...options
		};

		if (options.permissions && options.permissions.length) {
			await context.grantPermissions(options.permissions);
		}

		if (options.location) {
			await context.setGeolocation(options.location);
		}

		await page.waitForLoadState('networkidle');

		if (options.mocks) {
			await page.evaluate(`setEnv('mock', {patterns: ${options.mocks}});`);
		}

		await page.waitForLoadState('networkidle');

		if (options.reload) {
			await this.reloadAndWaitForIdle(page);
		}

		if (options.waitForEl) {
			await this.#parent.dom.waitForEl(page, options.waitForEl);
		}

		if (options.sleepAfter) {
			await delay(options.sleepAfter);
		}

	}

	/**
	 * @see [[BrowserTests.Utils.reloadAndWaitForIdle]]
	 */
	async reloadAndWaitForIdle(page, idleOptions) {
		await page.reload({waitUntil: 'networkidle'});
		await this.#parent.bom.waitForIdleCallback(page, idleOptions);
	}

	/**
	 * Parent class
	 * @type  {BrowserTests.Helpers}
	 */
	#parent;
}

module.exports = Utils;
