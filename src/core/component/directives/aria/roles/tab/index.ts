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

/**
 * [[include:core/component/directives/aria/roles/tab/README.md]]
 * @packageDocumentation
 */

import type iBlock from 'super/i-block/i-block';
import type iAccess from 'traits/i-access/i-access';

import { TabParams } from 'core/component/directives/aria/roles/tab/interface';
import { ARIARole, KeyCodes } from 'core/component/directives/aria/roles/interface';

export class Tab extends ARIARole {
	override Params: TabParams = new TabParams();
	override Ctx!: iBlock & iAccess;

	/** @inheritDoc */
	init(): void {
		const {
			el,
			params: {
				isFirst,
				isSelected,
				hasDefaultSelectedTabs
			}
		} = this;

		this.setAttribute('role', 'tab');
		this.setAttribute('aria-selected', String(isSelected));

		if (isFirst && !hasDefaultSelectedTabs) {
			if (el.tabIndex < 0) {
				this.setAttribute('tabindex', '0');
			}

		} else if (hasDefaultSelectedTabs && isSelected) {
			if (el.tabIndex < 0) {
				this.setAttribute('tabindex', '0');
			}

		} else {
			this.setAttribute('tabindex', '-1');
		}

		this.async.on(el, 'keydown', this.onKeydown.bind(this));
	}

	/**
	 * Moves focus to the first tab in the tablist
	 */
	protected moveFocusToFirstTab(): void {
		const firstTab = this.ctx?.findFocusableElement();
		firstTab?.focus();
	}

	/**
	 * Moves focus to the last tab in the tablist
	 */
	protected moveFocusToLastTab(): void {
		const
			tabs = this.ctx?.findFocusableElements();

		if (tabs == null) {
			return;
		}

		let
			lastTab: CanUndef<AccessibleElement>;

		for (const tab of tabs) {
			lastTab = tab;
		}

		lastTab?.focus();
	}

	/**
	 * Moves focus to the next or previous focusable element, according to the step parameter
	 * @param step
	 */
	protected moveFocus(step: 1 | -1): void {
		const focusable = this.ctx?.getNextFocusableElement(step);
		focusable?.focus();
	}

	/**
	 * Handler: the active tab has been changed
	 * @param active
	 */
	protected onChange(active: Element | NodeListOf<Element>): void {
		const setAttributes = (isSelected: boolean) => {
			this.setAttribute('aria-selected', String(isSelected));
			this.setAttribute('tabindex', isSelected ? '0' : '-1');
		};

		if (Object.isArrayLike(active)) {
			for (let i = 0; i < active.length; i++) {
				setAttributes(this.el === active[i]);
			}

			return;
		}

		setAttributes(this.el === active);
	}

	/**
	 * Handler: a keyboard event has occurred
	 */
	protected onKeydown(e: KeyboardEvent): void {
		const
			isVertical = this.params.orientation === 'vertical';

		switch (e.key) {
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
