/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { OptionParams } from 'core/component/directives/aria/roles-engines/option/interface';
import { AriaRoleEngine } from 'core/component/directives/aria/roles-engines/interface';

export class OptionEngine extends AriaRoleEngine {
	/** @see [[AriaRoleEngine.Params]] */
	override Params!: OptionParams;

	/** @see [[AriaRoleEngine.params]] */
	static override params: string[] = ['isSelected', '@change'];

	/* @inheritDoc */
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
