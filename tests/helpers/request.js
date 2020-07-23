/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

/**
 * @typedef {import('playwright').Page} Page
 * @typedef {import('playwright').BrowserContext} BrowserContext
 * @typedef {import('playwright').ElementHandle} ElementHandle
 */

/**
 * Class provides API to work with `b-router`.
 */
class Request {
	/**
	 * @param {BrowserTests.Helpers} parent
	 */
	constructor(parent) {
		this.#parent = parent;
	}

	/**
	 * @see [[BrowserTests.Request.waitForRequests]]
	 */
	waitForRequests(page, urls) {
		const normalized = [...urls];

		return new Promise((res) => {
			page.on('request', (request) => {
				const index = normalized.indexOf(request.url());

				if (index === -1) {
					return;
				}

				normalized.splice(index, 1);

				if (normalized.length === 0) {
					res();
				}
			});

		});
	}

	/**
	 * Parent class
	 * @type  {BrowserTests.Helpers}
	 */
	#parent;
}

module.exports = Request;
