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

import symbolGenerator from 'core/symbol';
import AriaRoleEngine, { DirectiveOptions, keyCodes } from 'core/component/directives/aria/interface';
import iAccess from 'traits/i-access/i-access';
import { FOCUSABLE_SELECTOR } from 'traits/i-access/const';
import type { TreeitemBindingValue } from 'core/component/directives/aria/roles-engines/interface';
import type iBlock from 'super/i-block/i-block';

export const
	$$ = symbolGenerator();

export default class TreeItemEngine extends AriaRoleEngine {
	ctx: iAccess & iBlock['unsafe'];
	el: HTMLElement;
	$v: TreeitemBindingValue;

	constructor(options: DirectiveOptions) {
		super(options);

		if (!iAccess.is(options.vnode.fakeContext)) {
			Object.throw('Treeitem aria directive expects the component to realize iAccess interface');
		}

		this.ctx = Object.cast<iAccess & iBlock['unsafe']>(options.vnode.fakeContext);
		this.el = this.options.el;
		this.$v = this.options.binding.value;
	}

	init(): void {
		this.$a?.on(this.el, 'keydown', this.onKeyDown);

		const
			isMuted = this.ctx.removeAllFromTabSequence(this.el);

		if (this.$v.isRootFirstItem) {
			if (isMuted) {
				this.ctx.restoreAllToTabSequence(this.el);

			} else {
				this.el.tabIndex = 0;
			}
		}

		this.el.setAttribute('role', 'treeitem');

		this.ctx.$nextTick(() => {
			if (this.$v.isExpandable) {
				this.el.setAttribute('aria-expanded', String(this.$v.isExpanded));
			}
		});
	}

	onKeyDown = (e: KeyboardEvent): void => {
		if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
			return;
		}

		switch (e.code) {
			case keyCodes.UP:
				this.moveFocus(-1);
				break;

			case keyCodes.DOWN:
				this.moveFocus(1);
				break;

			case keyCodes.ENTER:
				this.$v.toggleFold(this.el);
				break;

			case keyCodes.RIGHT:
				if (this.$v.isExpandable) {
					if (this.$v.isExpanded) {
						this.moveFocus(1);

					} else {
						this.openFold();
					}
				}

				break;

			case keyCodes.LEFT:
				if (this.$v.isExpandable && this.$v.isExpanded) {
					this.closeFold();

				} else {
					this.focusParent();
				}

				break;

			case keyCodes.HOME:
				this.setFocusToFirstItem();
				break;

			case keyCodes.END:
				this.setFocusToLastItem();
				break;

			default:
				return;
		}

		e.stopPropagation();
		e.preventDefault();
	};

	focusNext(nextEl: HTMLElement): void {
		this.ctx.removeAllFromTabSequence(this.el);
		this.ctx.restoreAllToTabSequence(nextEl);
		nextEl.focus();
	}

	moveFocus(step: 1 | -1): void {
		const
			nextEl = <CanUndef<HTMLElement>>this.ctx.getNextFocusableElement(step);

		if (nextEl != null) {
			this.focusNext(nextEl);
		}
	}

	openFold(): void {
		this.$v.toggleFold(this.el, false);
	}

	closeFold(): void {
		this.$v.toggleFold(this.el, true);
	}

	focusParent(): void {
		let
			parent = this.el.parentElement;

		while (parent != null) {
			if (parent.getAttribute('role') === 'treeitem') {
				break;
			}

			parent = parent.parentElement;
		}

		const
			focusableParent = (<CanUndef<HTMLElement>>parent?.querySelector(FOCUSABLE_SELECTOR));

		if (focusableParent != null) {
			this.focusNext(focusableParent);
		}
	}

	setFocusToFirstItem(): void {
		const
			firstEl = <CanUndef<HTMLElement>>this.$v.rootElement?.querySelector(FOCUSABLE_SELECTOR);

		if (firstEl != null) {
			this.focusNext(firstEl);
		}
	}

	setFocusToLastItem(): void {
		const
			items = <CanUndef<NodeListOf<HTMLElement>>>this.$v.rootElement?.querySelectorAll(FOCUSABLE_SELECTOR);

		const visibleItems: HTMLElement[] = [].filter.call(
			items,
			(el: HTMLElement) => (
				el.offsetWidth > 0 ||
				el.offsetHeight > 0
			)
		);

		const
			lastEl = visibleItems.at(-1);

		if (lastEl != null) {
			this.focusNext(lastEl);
		}
	}
}
