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
import iAccess from 'traits/i-access/i-access';

import type { TreeitemParams } from 'core/component/directives/aria/roles-engines/interface';
import type iBlock from 'super/i-block/i-block';

export default class TreeItemEngine extends AriaRoleEngine {
	/**
	 * Passed directive params
	 */
	params: TreeitemParams;

	/**
	 * Component instance
	 */
	ctx: iAccess & iBlock['unsafe'];

	/**
	 * Element with current directive
	 */
	el: HTMLElement;

	constructor(options: DirectiveOptions) {
		super(options);

		if (!iAccess.is(options.vnode.fakeContext)) {
			Object.throw('Treeitem aria directive expects the component to realize iAccess interface');
		}

		this.ctx = Object.cast<iAccess & iBlock['unsafe']>(options.vnode.fakeContext);
		this.el = this.options.el;
		this.params = this.options.binding.value;
	}

	/**
	 * Sets base aria attributes for current role
	 */
	init(): void {
		this.async?.on(this.el, 'keydown', this.onKeyDown.bind(this));

		const
			isMuted = this.ctx.removeAllFromTabSequence(this.el);

		if (this.params.isRootFirstItem) {
			if (isMuted) {
				this.ctx.restoreAllToTabSequence(this.el);

			} else {
				this.el.tabIndex = 0;
			}
		}

		this.el.setAttribute('role', 'treeitem');

		this.ctx.$nextTick(() => {
			if (this.params.isExpandable) {
				this.el.setAttribute('aria-expanded', String(this.params.isExpanded));
			}
		});
	}

	/**
	 * Changes focus from the current focused element to the passed one
	 * @param el
	 */
	protected focusNext(el: HTMLElement): void {
		this.ctx.removeAllFromTabSequence(this.el);
		this.ctx.restoreAllToTabSequence(el);

		el.focus();
	}

	/**
	 * Moves focus to the next or previous focusable element via the step parameter
	 * @param step
	 */
	protected moveFocus(step: 1 | -1): void {
		const
			nextEl = <CanUndef<HTMLElement>>this.ctx.getNextFocusableElement(step);

		if (nextEl != null) {
			this.focusNext(nextEl);
		}
	}

	/**
	 * Expands the treeitem
	 */
	protected openFold(): void {
		this.params.toggleFold(this.el, false);
	}

	/**
	 * Closes the treeitem
	 */
	protected closeFold(): void {
		this.params.toggleFold(this.el, true);
	}

	/**
	 * Moves focus to the parent treeitem
	 */
	protected focusParent(): void {
		let
			parent = this.el.parentElement;

		while (parent != null) {
			if (parent.getAttribute('role') === 'treeitem') {
				break;
			}

			parent = parent.parentElement;
		}

		if (parent == null) {
			return;
		}

		const
			focusableParent = <CanUndef<HTMLElement>>this.ctx.findFocusableElement(parent);

		if (focusableParent != null) {
			this.focusNext(focusableParent);
		}
	}

	/**
	 * Moves focus to the first visible treeitem
	 */
	protected setFocusToFirstItem(): void {
		const
			firstItem = <CanUndef<HTMLElement>>this.ctx.findFocusableElement(this.params.rootElement);

		if (firstItem != null) {
			this.focusNext(firstItem);
		}
	}

	/**
	 * Moves focus to the last visible treeitem
	 */
	protected setFocusToLastItem(): void {
		const
			items = <IterableIterator<HTMLElement>>this.ctx.findAllFocusableElements(this.params.rootElement);

		let
			lastItem: CanUndef<HTMLElement>;

		for (const item of items) {
			if (item.offsetWidth > 0 || item.offsetHeight > 0) {
				lastItem = item;
			}
		}

		if (lastItem != null) {
			this.focusNext(lastItem);
		}
	}

	/**
	 * Handler: keyboard event
	 */
	protected onKeyDown(e: KeyboardEvent): void {
		if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
			return;
		}

		switch (e.key) {
			case keyCodes.UP:
				this.moveFocus(-1);
				break;

			case keyCodes.DOWN:
				this.moveFocus(1);
				break;

			case keyCodes.ENTER:
				this.params.toggleFold(this.el);
				break;

			case keyCodes.RIGHT:
				if (this.params.isExpandable) {
					if (this.params.isExpanded) {
						this.moveFocus(1);

					} else {
						this.openFold();
					}
				}

				break;

			case keyCodes.LEFT:
				if (this.params.isExpandable && this.params.isExpanded) {
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
	}
}
