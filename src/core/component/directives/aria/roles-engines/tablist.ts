/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import AriaRoleEngine from 'core/component/directives/aria/interface';
import type { TablistParams } from 'core/component/directives/aria/roles-engines/interface';

export default class TablistEngine extends AriaRoleEngine {
	init(): void {
		const
			{el, binding} = this.options,
			params: TablistParams = binding.value;

		el.setAttribute('role', 'tablist');

		if (params.isMultiple) {
			el.setAttribute('aria-multiselectable', 'true');
		}

		if (params.isVertical) {
			el.setAttribute('aria-orientation', 'vertical');
		}
	}
}
