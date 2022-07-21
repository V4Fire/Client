/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import AriaRoleEngine from 'core/component/directives/aria/interface';

export default class ListboxEngine extends AriaRoleEngine {
	init(): void {
		const
			{el} = this.options,
			{value: {preSelected}} = this.options.binding;

		el.setAttribute('role', 'option');
		el.setAttribute('aria-selected', String(preSelected));
	}

	onChange = (isSelected: boolean): void => {
		const
			{el} = this.options;

		el.setAttribute('aria-selected', String(isSelected));
	};
}
