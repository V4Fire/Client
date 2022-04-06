/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Class provides API to work with requests
 */
export default class Request {
	/**
	 * Generates a random URL
	 */
	getRandomUrl(): string {
		return `https://v4fire-random-url.com/${String(Math.random()).substring(4)}`;
	}
}
