/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ARIARole } from 'core/component/directives/aria/roles/interface';

export class Dialog extends ARIARole {
	/** @inheritDoc */
	init(): void {
		this.setAttribute('role', 'dialog');
		this.setAttribute('aria-modal', 'true');
	}
}
