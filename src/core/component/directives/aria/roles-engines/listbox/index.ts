/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { AriaRoleEngine } from 'core/component/directives/aria/roles-engines/interface';

export class ListboxEngine extends AriaRoleEngine {
	/** @inheritDoc */
	init(): void {
		this.el.setAttribute('role', 'listbox');
		this.el.setAttribute('tabindex', '-1');
	}
}
