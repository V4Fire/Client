/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { AriaRole } from 'core/component/directives/aria/roles/interface';

export class ListboxEngine extends AriaRole {
	/** @inheritDoc */
	init(): void {
		this.setAttribute('role', 'listbox');
		this.setAttribute('tabindex', '-1');
	}
}
