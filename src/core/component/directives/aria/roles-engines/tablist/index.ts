/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { TablistParams } from 'core/component/directives/aria/roles-engines/tablist/interface';
import { AriaRoleEngine } from 'core/component/directives/aria/roles-engines/interface';

export class TablistEngine extends AriaRoleEngine {
	override Params: TablistParams = new TablistParams();

	/** @inheritDoc */
	init(): void {
		const
			{params} = this;

		this.setAttribute('role', 'tablist');

		if (params.isMultiple) {
			this.setAttribute('aria-multiselectable', 'true');
		}

		if (params.orientation === 'vertical') {
			this.setAttribute('aria-orientation', params.orientation);
		}
	}
}
