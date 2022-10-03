/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iBlock from 'super/i-block/i-block';

import { ComboboxParams } from 'core/component/directives/aria/roles/combobox/interface';
import { ARIARole, RoleOptions } from 'core/component/directives/aria/roles/interface';

export class Combobox extends ARIARole {
	override Params: ComboboxParams = new ComboboxParams();
	override Ctx!: iBlock['unsafe'];
	override el: HTMLElement;

	constructor(options: RoleOptions<ComboboxParams>) {
		super(options);

		const
			{el} = this;

		this.el = this.ctx?.dom.findFocusableElement() ?? el;
	}

	/** @inheritDoc */
	init(): void {
		this.setAttribute('role', 'combobox');
		this.setAttribute('aria-expanded', 'false');

		if (this.el.tabIndex < 0) {
			this.setAttribute('tabindex', '0');
		}
	}

	/**
	 * Sets or deletes the id of active descendant element
	 */
	protected setARIAActive(el?: Element): void {
		this.setAttribute('aria-activedescendant', el?.id ?? '');
	}

	/**
	 * Handler: the option list is expanded
	 * @param el
	 */
	protected onOpen(el: Element): void {
		this.setAttribute('aria-expanded', 'true');
		this.setARIAActive(el);
	}

	/**
	 * Handler: the option list is closed
	 */
	protected onClose(): void {
		this.setAttribute('aria-expanded', 'false');
		this.setARIAActive();
	}

	/**
	 * Handler: active option element was changed
	 * @param el
	 */
	protected onChange(el: Element): void {
		this.setARIAActive(el);
	}
}
