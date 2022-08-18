/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iAccess from 'traits/i-access/i-access';
import type { ComponentInterface } from 'super/i-block/i-block';

import type { ComboboxParams } from 'core/component/directives/aria/roles-engines/combobox/interface';
import { AriaRoleEngine, EngineOptions } from 'core/component/directives/aria/roles-engines/interface';

export class ComboboxEngine extends AriaRoleEngine {
	/** @see [[AriaRoleEngine.Prams]] */
	override Params!: ComboboxParams;

	/** @see [[AriaRoleEngine.el]] */
	override el: HTMLElement;

	/** @see [[AriaRoleEngine.Ctx]] */
	override Ctx!: ComponentInterface & iAccess;

	/** @see [[AriaRoleEngine.params]] */
	static override params: string[] = ['isMultiple', '@change', '@open', '@close'];

	constructor(options: EngineOptions<ComboboxParams, ComponentInterface & iAccess>) {
		super(options);

		const
			{el} = this;

		this.el = this.ctx?.findFocusableElement() ?? el;
	}

	/* @inheritDoc */
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
