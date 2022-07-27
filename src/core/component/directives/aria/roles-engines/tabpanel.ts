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
			{el, binding} = this.options;

		el.setAttribute('role', 'tabpanel');

		if (binding.value?.labelledby == null) {
			Object.throw('Tabpanel aria directive expects "label" or "labelledby" value to be passed');
		}
	}
}
