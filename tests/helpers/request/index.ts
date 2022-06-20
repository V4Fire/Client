/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Class provides API to work with requests on a page
 */
export default class Request {
	/**
	 * Generates a random URL
	 */
	static getRandomUrl(): string {
		return `https://v4fire-random-url.com/${String(Math.random()).substring(4)}`;
	}

	/**
	 * @deprecated
	 * @see [[Request.getRandomUrl]]
	 */
	getRandomUrl(): string {
		return Request.getRandomUrl();
	}
}
