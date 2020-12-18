/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:traits/i-icon/README.md]]
 * @packageDocumentation
 */

import { icons, iconsMap } from 'traits/i-icon/modules/icons';

export default abstract class iIcon {
	/**
	 * Returns a link for the specified icon
	 * @param iconId
	 */
	static async getIconLink(iconId: string): Promise<string> {
		if (!(iconId in iconsMap)) {
			throw new ReferenceError(`The specified icon "${iconId}" is not defined`);
		}

		let
			q = '';

		if (location.search !== '') {
			q = location.search;

		} else {
			q = location.href.endsWith('?') ? '?' : '';
		}

		const icon = await icons(iconsMap[iconId]);
		return `${location.pathname + q}#${icon.id}`;
	}

	/**
	 * Link to iIcon.getIconLink
	 */
	abstract getIconLink: typeof iIcon.getIconLink;
}
