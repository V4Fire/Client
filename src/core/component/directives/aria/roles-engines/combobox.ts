/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import AriaRoleEngine, { DirectiveOptions } from 'core/component/directives/aria/interface';
import { FOCUSABLE_SELECTOR } from 'traits/i-access/const';
import type { ComboboxBindingValue } from 'core/component/directives/aria/roles-engines/interface';

export default class ComboboxEngine extends AriaRoleEngine {
	el: Element;
	$v: ComboboxBindingValue;

	constructor(options: DirectiveOptions) {
		super(options);

		const
			{el} = this.options;

		this.el = el.querySelector(FOCUSABLE_SELECTOR) ?? el;
		this.$v = this.options.binding.value;
	}

	init(): void {
		this.el.setAttribute('role', 'combobox');
		this.el.setAttribute('aria-expanded', 'false');

		if (this.$v.isMultiple) {
			this.el.setAttribute('aria-multiselectable', 'true');
		}
	}

	onOpen = (element: HTMLElement): void => {
		this.el.setAttribute('aria-expanded', 'true');

		this.setAriaActive(element);
	};

	onClose = (): void => {
		this.el.setAttribute('aria-expanded', 'false');

		this.setAriaActive();
	};

	onChange = (element: HTMLElement): void => {
		this.setAriaActive(element);
	};

	setAriaActive = (element?: HTMLElement): void => {
		this.el.setAttribute('aria-activedescendant', element?.id ?? '');
	};
}
