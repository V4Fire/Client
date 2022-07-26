/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import AriaRoleEngine, { DirectiveOptions } from 'core/component/directives/aria/interface';
import type { ComboboxParams } from 'core/component/directives/aria/roles-engines/interface';
import type iAccess from 'traits/i-access/i-access';

export default class ComboboxEngine extends AriaRoleEngine {
	el: Element;
	params: ComboboxParams;

	constructor(options: DirectiveOptions) {
		super(options);

		const
			{el} = this.options,
			ctx = Object.cast<iAccess>(this.options.vnode.fakeContext);

		this.el = ctx.findFocusableElement() ?? el;
		this.params = this.options.binding.value;
	}

	init(): void {
		this.el.setAttribute('role', 'combobox');
		this.el.setAttribute('aria-expanded', 'false');

		if (this.params.isMultiple) {
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
