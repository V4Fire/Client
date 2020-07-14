/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { match } from 'core/browser/helpers';

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
		return this.Android ?? this.BlackBerry ?? this.iOS ?? this.OperaMini ?? this.WindowsMobile ?? false;
	}
};
