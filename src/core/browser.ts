/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import semver, { Operations } from 'core/semver';

const
	agent = navigator.userAgent,
	separator = /[._]/;

/**
 * Returns a tuple (browserName, browserVersion?[]) or false from the specified pattern
 * @param pattern
 */
export function match(pattern: RegExp | string): [string, number[] | null] | boolean {
	const
		rgxp = Object.isString(pattern) ? new RegExp(`(${pattern})(?:[ \\/-]([0-9._]*))?`, 'i') : pattern,
		res = agent.match(rgxp);

	return res ?
		[res[1], res[2] ? res[2].split(separator).map((el) => parseInt(String(el), 10) || 0) : null] :
		false;
}

/**
 * Returns true if navigator.userAgent matches the specified parameters
 *
 * @param platform - browser platform
 * @param [operation] - operation type (>, >=, etc.)
 * @param [version] - browser version
 */
export function test(platform: string, operation?: Operations, version?: string): boolean {
	const
		val = is[platform];

	if (!val) {
		return false;
	}

	if (!operation || !version) {
		return true;
	}

	if (!val[1]) {
		return false;
	}

	return semver(val[1].join('.'), version, operation);
}

export const is = {
	Chrome: match('Chrome'),
	Firefox: match('Firefox'),
	Android: match('Android'),
	BlackBerry: match('BlackBerry'),
	iOS: match('(?:iPhone|iPad|iPod);[ \\w]+(?= \\d)'),
	OperaMini: match('Opera Mini'),
	WindowsMobile: match('IEMobile'),

	/**
	 * Version of the current mobile browser or false
	 */
	get mobile(): string[] | boolean {
		return this.Android || this.BlackBerry || this.iOS || this.OperaMini || this.WindowsMobile || false;
	}
};
