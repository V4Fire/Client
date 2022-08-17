/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { OptionParams } from 'core/component/directives/aria/roles-engines/option/interface';
import { AriaRoleEngine, EngineOptions } from 'core/component/directives/aria/roles-engines/interface';

export class OptionEngine extends AriaRoleEngine {
	/**
	 * Engine params
	 */
	override params: OptionParams;

	/**
	 * Engine params list
	 */
	static override params: string[] = ['isSelected', '@change'];

	constructor(options: EngineOptions<OptionParams>) {
		super(options);

		this.params = options.params;
	}

	/**
	 * Sets base aria attributes for current role
	 */
	init(): void {
		this.el.setAttribute('role', 'option');
		this.el.setAttribute('aria-selected', String(this.params.isSelected));
	}

	/**
	 * Handler: selected option changes
	 * @param isSelected
	 */
	protected onChange(isSelected: boolean): void {
		this.el.setAttribute('aria-selected', String(isSelected));
	}
}
