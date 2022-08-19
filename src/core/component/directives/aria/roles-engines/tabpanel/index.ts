/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { AriaRoleEngine } from 'core/component/directives/aria/roles-engines/interface';

export class TabpanelEngine extends AriaRoleEngine {
	/** @inheritDoc */
	init(): void {
		const
			{el} = this;

		if (!el.hasAttribute('aria-label') && !el.hasAttribute('aria-labelledby')) {
			Object.throw('Tabpanel aria directive expects "label" or "labelledby" value to be passed');
		}

		this.setAttribute('role', 'tabpanel');
	}
}
