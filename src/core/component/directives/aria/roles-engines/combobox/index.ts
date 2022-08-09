/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ComboboxParams } from 'core/component/directives/aria/roles-engines/combobox/interface';
import { AriaRoleEngine, EngineOptions } from 'core/component/directives/aria/roles-engines/interface';

export class ComboboxEngine extends AriaRoleEngine {
	/**
	 * Engine params
	 */
	params: ComboboxParams;

	/**
	 * First focusable element inside the element with directive or this element if there is no focusable inside
	 */
	override el: HTMLElement;

	constructor(options: EngineOptions) {
		super(options);

		const
			{el} = this;

		this.el = this.ctx?.findFocusableElement<HTMLElement>() ?? el;
		this.params = options.params;
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
