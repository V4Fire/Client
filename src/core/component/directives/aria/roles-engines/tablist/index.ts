/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { TablistParams } from 'core/component/directives/aria/roles-engines/tablist/interface';
import { AriaRoleEngine, EngineOptions } from 'core/component/directives/aria/roles-engines/interface';

export class TablistEngine extends AriaRoleEngine {
	/**
	 * Engine params
	 */
	override params: TablistParams;

	/**
	 * Engine params list
	 */
	static override params: string[] = ['isMultiple', 'orientation'];

	constructor(options: EngineOptions<TablistParams>) {
		super(options);

		this.params = options.params;
	}

	/**
	 * Sets base aria attributes for current role
	 */
	init(): void {
		const
			{el, params} = this;

		el.setAttribute('role', 'tablist');

		if (params.isMultiple) {
			el.setAttribute('aria-multiselectable', 'true');
		}

		if (params.orientation === 'vertical') {
			el.setAttribute('aria-orientation', params.orientation);
		}
	}
}
