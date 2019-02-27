/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { icons, iconsMap } from 'traits/i-icon/modules/icons';

export default abstract class iIcon {
	/**
	 * Returns a link for the specified icon
	 * @param iconId
	 */
	static getIconLink(iconId: string): string {
		if (!(iconId in iconsMap)) {
			throw new ReferenceError(`The specified icon "${iconId}" is not defined`);
		}

		const q = location.search || (location.href.slice(-1) === '?' ? '?' : '');
		return `${location.pathname + q}#${icons(iconsMap[iconId]).id}`;
	}

	/**
	 * Link to iIcon.getIconLink
	 */
	abstract getIconLink: typeof iIcon.getIconLink;
}
