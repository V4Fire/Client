/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { match } from 'core/browser/helpers';

/**
 * A map of supported environments for detection.
 * If the current `navigator.userAgent` matches one of the map keys,
 * the value will be a tuple of `[browserName, browserVersion?[]]`.
 * If it doesn't match, the value will be `false`.
 */
export const is = {
	Chrome: match('Chrome'),
	Firefox: match('Firefox'),
	Android: match('Android'),
	BlackBerry: match('BlackBerry'),
	iOS: match('(?:iPhone|iPad|iPod);[ \\w]+(?= \\d)'),
	OperaMini: match('Opera Mini'),
	WindowsMobile: match('IEMobile'),
	Safari: match((ua: string) => {
		const res = /Version\/([\d.]+).*(Safari)/.exec(ua);
		return res == null ? null : [res[2], res[1]];
	}),

	/**
	 * Returns the `[browserName, browserVersion?[]]` tuple if the current navigator.userAgent is a mobile browser.
	 * Otherwise, it returns `false`.
	 */
	get mobile(): [string, number[] | null] | false {
		// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
		return this.Android || this.BlackBerry || this.iOS || this.OperaMini || this.WindowsMobile || false;
	}
};
