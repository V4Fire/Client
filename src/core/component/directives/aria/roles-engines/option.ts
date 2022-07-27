/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import AriaRoleEngine from 'core/component/directives/aria/interface';

export default class OptionEngine extends AriaRoleEngine {
	/**
	 * Sets base aria attributes for current role
	 */
	init(): void {
		const
			{el} = this.options,
			{value: {preSelected}} = this.options.binding;

		el.setAttribute('role', 'option');
		el.setAttribute('aria-selected', String(preSelected));

		if (!el.hasAttribute('id')) {
			Object.throw('Option aria directive expects the Element id to be added');
		}
	}

	/**
	 * Handler: selected option changes
	 * @param isSelected
	 */
	protected onChange(isSelected: boolean): void {
		const
			{el} = this.options;

		el.setAttribute('aria-selected', String(isSelected));
	}
}
