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
		return this.waitForRequestsEvents(page, urls, 'request');
	}

	/**
	 * @see [[BrowserTests.Request.waitForRequestsFail]]
	 */
	waitForRequestsFail(page, urls) {
		return this.waitForRequestsEvents(page, urls, 'requestfailed');
	}

	/**
	 * @see [[BrowserTests.Request.waitForRequestsEvents]]
	 * @private
	 */
	waitForRequestsEvents(page, urls, event) {
		const normalized = [...urls];

		return new Promise((res) => {
			page.on(event, (request) => {
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
	 * @see [[BrowserTests.Request.interceptRequests]]
	 */
	interceptRequests(page, urls, response, timeout) {
		return Promise.all(urls.map((url) => this.interceptRequest(page, url, response, timeout)));
	}

	/**
	 * @see [[BrowserTests.Request.interceptRequest]]
	 */
	interceptRequest(page, url, response, timeout) {
		return new Promise((res, rej) => {
			if (timeout != null) {
				setTimeout(rej, timeout);
			}

			page.route(url, (route) => {
				route.fulfill({status: 200, ...response});
				res();
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
