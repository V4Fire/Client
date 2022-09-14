/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { TablistParams } from 'core/component/directives/aria/roles/tablist/interface';
import { ARIARole } from 'core/component/directives/aria/roles/interface';

export class Tablist extends ARIARole {
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
