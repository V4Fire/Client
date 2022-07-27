/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iOpen from 'traits/i-open/i-open';
import AriaRoleEngine from 'core/component/directives/aria/interface';

export default class DialogEngine extends AriaRoleEngine {
	/**
	 * Sets base aria attributes for current role
	 */
	init(): void {
		const
			{el, vnode} = this.options;

		el.setAttribute('role', 'dialog');
		el.setAttribute('aria-modal', 'true');

		if (!iOpen.is(vnode.fakeContext)) {
			Object.throw('Dialog aria directive expects the component to realize iOpen interface');
		}
	}
}
