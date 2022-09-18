/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { OptionParams } from 'core/component/directives/aria/roles/option/interface';
import { ARIARole } from 'core/component/directives/aria/roles/interface';

export class Option extends ARIARole {
	override Params: OptionParams = new OptionParams();

	/** @inheritDoc */
	init(): void {
		this.setAttribute('role', 'option');
	}

	/**
	 * Handler: selected option changes
	 * @param isSelected
	 */
	protected onChange(isSelected: boolean): void {
		this.el.setAttribute('aria-selected', String(isSelected));
	}
}
