// @ts-check

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

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
			let
				isClosed = false;

			const handleClose = () => isClosed = true;

			page.once('close', handleClose);

			const handler = async (route) => {
				page.removeListener('close', handleClose);

				if (isClosed) {
					res();
					return;
				}

				await route.fulfill({status: 200, ...response});
				await page.unroute(url, handler);
				res();
			};

			if (timeout != null) {
				setTimeout(() => {
					page.unroute(url, handler);
					rej();
				}, timeout);
			}

			page.route(url, handler);
		});
	}

	/**
	 * @see [[BrowserTests.Request.getRandomUrl]]
	 */
	getRandomUrl() {
		return `https://v4fire-random-url.com/${String(Math.random()).substring(4)}`;
	}

	/**
	 * Parent class
	 * @type  {BrowserTests.Helpers}
	 */
	#parent;
}

module.exports = Request;
