// @ts-check

/// <reference path="../../../ts-definitions/perf.d.ts" />

'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

class Browser {
	/**
	 * @param {import('playwright').LaunchOptions} options
	 * @return {Promise<import('playwright').ChromiumBrowser>}
	 */
	static create(options) {
		const
			pw = require('playwright');

		return pw.chromium.launch(options);
	}

	/**
	 * @param {import('playwright').ChromiumBrowser} browser
	 * @returns {Promise<import('playwright').BrowserContext>}
	 */
	static getContext(browser) {
		// ...
	}

	/**
	 * @param {import('playwright').BrowserContext} context
	 * @returns {import('playwright').Page}
	 */
	static getPage(context) {
		// ...
	}
}

module.exports.Browser = Browser;
