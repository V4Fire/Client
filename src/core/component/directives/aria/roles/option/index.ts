/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { OptionParams } from 'core/component/directives/aria/roles/option/interface';
import { AriaRole } from 'core/component/directives/aria/roles/interface';

export class OptionEngine extends AriaRole {
	override Params: OptionParams = new OptionParams();

	/** @inheritDoc */
	init(): void {
		this.setAttribute('role', 'option');
		this.setAttribute('aria-selected', String(this.params.isSelected));
	}

	/**
	 * Handler: selected option changes
	 * @param isSelected
	 */
	protected onChange(isSelected: boolean): void {
		this.el.setAttribute('aria-selected', String(isSelected));
	}
}
