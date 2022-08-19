/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iAccess from 'traits/i-access/i-access';
import type { ComponentInterface } from 'super/i-block/i-block';

import { ComboboxParams } from 'core/component/directives/aria/roles-engines/combobox/interface';
import { AriaRoleEngine, EngineOptions } from 'core/component/directives/aria/roles-engines/interface';

export class ComboboxEngine extends AriaRoleEngine {
	override Params: ComboboxParams = new ComboboxParams();
	override Ctx!: ComponentInterface & iAccess;
	override el: HTMLElement;

	constructor(options: EngineOptions<ComboboxParams, ComponentInterface & iAccess>) {
		super(options);

		const
			{el} = this;

		this.el = this.ctx?.findFocusableElement() ?? el;
	}

	/** @inheritDoc */
	init(): void {
		this.setAttribute('role', 'combobox');
		this.setAttribute('aria-expanded', 'false');

		if (this.params.isMultiple) {
			this.setAttribute('aria-multiselectable', 'true');
		}

		if (this.el.tabIndex < 0) {
			this.setAttribute('tabindex', '0');
		}
	}

	/**
	 * Sets or deletes the id of active descendant element
	 */
	protected setAriaActive(el?: HTMLElement): void {
		this.setAttribute('aria-activedescendant', el?.id ?? '');
	}

	/**
	 * Handler: the option list is expanded
	 * @param el
	 */
	protected onOpen(el: HTMLElement): void {
		this.setAttribute('aria-expanded', 'true');
		this.setAriaActive(el);
	}

	/**
	 * Handler: the option list is closed
	 */
	protected onClose(): void {
		this.setAttribute('aria-expanded', 'false');
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
