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

import AriaRoleEngine, { DirectiveOptions, keyCodes } from 'core/component/directives/aria/interface';
import type { TabParams } from 'core/component/directives/aria/roles-engines/interface';
import type iAccess from 'traits/i-access/i-access';
import type iBlock from 'super/i-block/i-block';

export default class TabEngine extends AriaRoleEngine {
	params: TabParams;
	ctx: iAccess & iBlock;

	constructor(options: DirectiveOptions) {
		super(options);

		this.params = this.options.binding.value;
		this.ctx = Object.cast<iAccess & iBlock>(this.options.vnode.fakeContext);
	}

	init(): void {
		const
			{el} = this.options,
			{isFirst} = this.params;

		el.setAttribute('role', 'tab');
		el.setAttribute('aria-selected', String(this.params.isActive));

		if (isFirst) {
			if (el.tabIndex < 0) {
				el.setAttribute('tabindex', '0');
			}

		} else {
			el.setAttribute('tabindex', '-1');
		}

		if (this.async != null) {
			this.async.on(el, 'keydown', this.onKeydown);
		}
	}

	onChange = (active: Element | NodeListOf<Element>): void => {
		const
			{el} = this.options;

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
	};

	moveFocusToFirstTab(): void {
		const
			firstTab = <CanUndef<HTMLElement>>this.ctx.findFocusableElement();

		firstTab?.focus();
	}

	moveFocusToLastTab(): void {
		const
			tabs = <IterableIterator<HTMLElement>>this.ctx.findAllFocusableElements();

		let
			lastTab: CanUndef<HTMLElement>;

		for (const tab of tabs) {
			lastTab = tab;
		}

		lastTab?.focus();
	}

	moveFocus(step: 1 | -1): void {
		const
			focusable = <CanUndef<HTMLElement>>this.ctx.getNextFocusableElement(step);

		focusable?.focus();
	}

	onKeydown = (event: Event): void => {
		const
			evt = (<KeyboardEvent>event),
			{isVertical} = this.params;

		switch (evt.key) {
			case keyCodes.LEFT:
				this.moveFocus(-1);
				break;

			case keyCodes.UP:
				if (isVertical) {
					this.moveFocus(-1);
					break;
				}

				return;

			case keyCodes.RIGHT:
				this.moveFocus(1);
				break;

			case keyCodes.DOWN:
				if (isVertical) {
					this.moveFocus(1);
					break;
				}

				return;

			case keyCodes.HOME:
				this.moveFocusToFirstTab();
				break;

			case keyCodes.END:
				this.moveFocusToLastTab();
				break;

			default:
				return;
		}

		event.stopPropagation();
		event.preventDefault();
	};
}
