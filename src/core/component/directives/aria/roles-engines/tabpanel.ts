/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import AriaRoleEngine from 'core/component/directives/aria/interface';

export default class TabpanelEngine extends AriaRoleEngine {
	/**
	 * Sets base aria attributes for current role
	 */
	init(): void {
		const
			{el} = this.options;

		if (!el.hasAttribute('aria-label') && !el.hasAttribute('aria-labelledby')) {
			Object.throw('Tabpanel aria directive expects "label" or "labelledby" value to be passed');
			return;
		}

		el.setAttribute('role', 'tabpanel');
	}
}
