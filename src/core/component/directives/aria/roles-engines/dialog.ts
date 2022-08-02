/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import AriaRoleEngine from 'core/component/directives/aria/interface';

export default class DialogEngine extends AriaRoleEngine {
	/**
	 * Sets base aria attributes for current role
	 */
	init(): void {
		const
			{el} = this.options;

		el.setAttribute('role', 'dialog');
		el.setAttribute('aria-modal', 'true');
	}
}
