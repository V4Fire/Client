/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { match } from 'core/browser/helpers';

/**
 * Map of the supported environment to detect. If the current `navigator.userAgent` matches one of the map' key,
 * the value will contain a tuple `[browserName, browserVersion?[]]`. Otherwise, it is `false`.
 */
export const is = {
	Chrome: match('Chrome'),
	Firefox: match('Firefox'),
	Android: match('Android'),
	BlackBerry: match('BlackBerry'),
	iOS: match('(?:iPhone|iPad|iPod);[ \\w]+(?= \\d)'),
	OperaMini: match('Opera Mini'),
	WindowsMobile: match('IEMobile'),
	Safari: match('/Version\\/[\\d.]+.*Safari/'),

	/**
	 * A tuple `[browserName, browserVersion?[]]` if the current `navigator.userAgent` is a mobile browser.
	 * Otherwise, it is `false`.
	 */
	get mobile(): [string, number[] | null] | false {
		// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
		return this.Android || this.BlackBerry || this.iOS || this.OperaMini || this.WindowsMobile || false;
	}
};
