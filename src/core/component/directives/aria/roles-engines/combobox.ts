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
	/**
	 * Passed directive params
	 */
	params: ComboboxParams;

	/**
	 * First focusable element inside the element with directive or this element if there is no focusable inside
	 */
	el: HTMLElement;

	constructor(options: DirectiveOptions) {
		super(options);

		const
			{el} = this.options,
			ctx = Object.cast<iAccess>(this.options.vnode.fakeContext);

		this.el = (<CanUndef<HTMLElement>>ctx.findFocusableElement()) ?? el;
		this.params = this.options.binding.value;
	}

	/**
	 * Sets base aria attributes for current role
	 */
	init(): void {
		this.el.setAttribute('role', 'combobox');
		this.el.setAttribute('aria-expanded', 'false');

		if (this.params.isMultiple) {
			this.el.setAttribute('aria-multiselectable', 'true');
		}

		if (this.el.tabIndex < 0) {
			this.el.setAttribute('tabindex', '0');
		}
	}

	/**
	 * Sets or deletes the id of active descendant element
	 */
	protected setAriaActive(el?: HTMLElement): void {
		this.el.setAttribute('aria-activedescendant', el?.id ?? '');
	}

	/**
	 * Handler: the option list is expanded
	 * @param el
	 */
	protected onOpen(el: HTMLElement): void {
		this.el.setAttribute('aria-expanded', 'true');
		this.setAriaActive(el);
	}

	/**
	 * Handler: the option list is closed
	 */
	protected onClose(): void {
		this.el.setAttribute('aria-expanded', 'false');
		this.setAriaActive();
	}

	/**
	 * Handler: active option element was changed
	 * @param el
	 */
	protected onChange(el: HTMLElement): void {
		this.setAriaActive(el);
	}
}
