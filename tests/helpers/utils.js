// @ts-check

const
	delay = require('delay');

/**
 * @typedef {import('playwright').Page} Page
 * @typedef {import('playwright').BrowserContext} BrowserContext
 */

class Utils {

	/**
	 * Parent class
	 */
	#parent;

	/**
	 * @param parent
	 */
	constructor(parent) {
		this.#parent = parent;
	}

	/**
	 * @param {Page} page
	 * @param {BrowserContext} context
	 * @param {Object=} [options]
	 *
	 * @returns {!Promise<void>}
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
	 * @param {Page} page
	 * @param {Object=} [idleOptions]
	 *
	 * @returns {!Promise<void>}
	 */
	async reloadAndWaitForIdle(page, idleOptions) {
		await page.reload({waitUntil: 'networkidle'});
		await this.#parent.bom.waitForIdleCallback(page, idleOptions);
	}
}

module.exports = Utils;
