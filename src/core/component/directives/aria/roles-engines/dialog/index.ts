/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { AriaRoleEngine } from 'core/component/directives/aria/roles-engines/interface';
import iOpen from 'traits/i-open/i-open';

export class DialogEngine extends AriaRoleEngine {
	/** @inheritDoc */
	init(): void {
		this.setAttribute('role', 'dialog');
		this.setAttribute('aria-modal', 'true');

		if (!iOpen.is(this.ctx)) {
			Object.throw('Dialog aria directive expects the component to realize iOpen interface');
		}
	}
}
