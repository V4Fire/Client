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
import type { TabBindingValue } from 'core/component/directives/aria/roles-engines/interface';
import type iAccess from 'traits/i-access/i-access';
import type iBlock from 'super/i-block/i-block';
import { FOCUSABLE_SELECTOR } from 'traits/i-access/const';

export default class TabEngine extends AriaRoleEngine {
	$v: TabBindingValue;
	ctx: iAccess & iBlock;

	constructor(options: DirectiveOptions) {
		super(options);

		this.$v = this.options.binding.value;
		this.ctx = Object.cast<iAccess & iBlock>(this.options.vnode.fakeContext);
	}

	init(): void {
		const
			{el} = this.options,
			{isFirst} = this.$v;

		el.setAttribute('role', 'tab');
		el.setAttribute('aria-selected', 'false');

		if (isFirst) {
			if (el.tabIndex < 0) {
				el.setAttribute('tabindex', '0');
			}

		} else {
			el.setAttribute('tabindex', '-1');
		}

		this.$v.activeElement?.then((el) => {
			if (Object.isArray(el)) {
				for (let i = 0; i < el.length; i++) {
					const
						activeEl = el[i];

					if (activeEl.getAttribute('aria-selected') !== 'true') {
						activeEl.setAttribute('aria-selected', 'true');
					}
				}

				return;
			}

			if (el.getAttribute('aria-selected') !== 'true') {
				el.setAttribute('aria-selected', 'true');
			}
		});

		if (this.$a != null) {
			this.$a.on(el, 'keydown', this.onKeydown);
		}
	}

	onChange = (active: Element | NodeListOf<Element>): void => {
		const
			{el} = this.options;

		if (Object.isArrayLike(active)) {
			for (let i = 0; i < active.length; i++) {
				el.setAttribute('aria-selected', String(el === active[i]));
			}

			return;
		}

		el.setAttribute('aria-selected', String(el === active));
	};

	moveFocusToFirstTab(): void {
		const
			firstEl = <CanUndef<HTMLElement>>this.ctx.$el?.querySelector(FOCUSABLE_SELECTOR);

		firstEl?.focus();
	}

	moveFocusToLastTab(): void {
		const
			focusable = <CanUndef<NodeListOf<HTMLElement>>>this.ctx.$el?.querySelectorAll(FOCUSABLE_SELECTOR);

		if (focusable != null && focusable.length > 0) {
			focusable[focusable.length - 1].focus();
		}
	}

	focusNext(): void {
		this.ctx.nextFocusableElement(1)?.focus();
	}

	focusPrev(): void {
		this.ctx.nextFocusableElement(-1)?.focus();
	}

	onKeydown = (event: Event): void => {
		const
			evt = (<KeyboardEvent>event),
			{isVertical} = this.$v;

		switch (evt.key) {
			case keyCodes.LEFT:
				this.focusPrev();
				break;

			case keyCodes.UP:
				if (isVertical) {
					this.focusPrev();
					break;
				}

				return;

			case keyCodes.RIGHT:
				this.focusNext();
				break;

			case keyCodes.DOWN:
				if (isVertical) {
					this.focusNext();
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
