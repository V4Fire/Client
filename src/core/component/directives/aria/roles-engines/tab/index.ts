/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 *
 * This software or document includes material copied from or derived from ["Example of Tabs with Manual Activation", https://www.w3.org/WAI/ARIA/apg/example-index/tabs/tabs-manual.html].
 * Copyright © [2022] W3C® (MIT, ERCIM, Keio, Beihang).
 */

import type iBlock from 'super/i-block/i-block';
import type iAccess from 'traits/i-access/i-access';

import type { TabParams } from 'core/component/directives/aria/roles-engines/tab/interface';
import { AriaRoleEngine, EngineOptions, KeyCodes } from 'core/component/directives/aria/roles-engines/interface';

export class TabEngine extends AriaRoleEngine {
	/**
	 * Engine params
	 */
	override params: TabParams;

	/** @see [[AriaRoleEngine.ctx]] */
	override ctx?: iBlock & iAccess;

	constructor(options: EngineOptions<TabParams>) {
		super(options);

		this.params = options.params;
	}

	/**
	 * Sets base aria attributes for current role
	 */
	init(): void {
		const
			{el} = this,
			{isFirst, isSelected, hasDefaultSelectedTabs} = this.params;

		el.setAttribute('role', 'tab');
		el.setAttribute('aria-selected', String(isSelected));

		if (isFirst && !hasDefaultSelectedTabs) {
			if (el.tabIndex < 0) {
				el.setAttribute('tabindex', '0');
			}

		} else if (hasDefaultSelectedTabs && isSelected) {
			if (el.tabIndex < 0) {
				el.setAttribute('tabindex', '0');
			}

		} else {
			el.setAttribute('tabindex', '-1');
		}

		if (this.async != null) {
			this.async.on(el, 'keydown', this.onKeydown.bind(this));
		}
	}

	/**
	 * Moves focus to the first tab in tablist
	 */
	protected moveFocusToFirstTab(): void {
		const
			firstTab = this.ctx?.findFocusableElement<HTMLElement>();

		firstTab?.focus();
	}

	/**
	 * Moves focus to the last tab in tablist
	 */
	protected moveFocusToLastTab(): void {
		const
			tabs = this.ctx?.findAllFocusableElements<HTMLElement>();

		if (tabs == null) {
			return;
		}

		let
			lastTab: CanUndef<HTMLElement>;

		for (const tab of tabs) {
			lastTab = tab;
		}

		lastTab?.focus();
	}

	/**
	 * Moves focus to the next or previous focusable element via the step parameter
	 * @param step
	 */
	protected moveFocus(step: 1 | -1): void {
		const
			focusable = this.ctx?.getNextFocusableElement(step);

		focusable?.focus();
	}

	/**
	 * Handler: active tab changes
	 * @param active
	 */
	protected onChange(active: Element | NodeListOf<Element>): void {
		const
			{el} = this;

		function setAttributes(isSelected: boolean) {
			el.setAttribute('aria-selected', String(isSelected));
			el.setAttribute('tabindex', isSelected ? '0' : '-1');
		}

		if (Object.isArrayLike(active)) {
			for (let i = 0; i < active.length; i++) {
				setAttributes(el === active[i]);
			}

			return;
		}

		setAttributes(el === active);
	}

	/**
	 * Handler: keyboard event
	 */
	protected onKeydown(e: Event): void {
		const
			evt = (<KeyboardEvent>e),
			isVertical = this.params.orientation === 'vertical';

		switch (evt.key) {
			case KeyCodes.LEFT:
				if (isVertical) {
					return;
				}

				this.moveFocus(-1);
				break;

			case KeyCodes.UP:
				if (isVertical) {
					this.moveFocus(-1);
					break;
				}

				return;

			case KeyCodes.RIGHT:
				if (isVertical) {
					return;
				}

				this.moveFocus(1);
				break;

			case KeyCodes.DOWN:
				if (isVertical) {
					this.moveFocus(1);
					break;
				}

				return;

			case KeyCodes.HOME:
				this.moveFocusToFirstTab();
				break;

			case KeyCodes.END:
				this.moveFocusToLastTab();
				break;

			default:
				return;
		}

		e.stopPropagation();
		e.preventDefault();
	}
}
