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

import iAccess from 'traits/i-access/i-access';
import type iBlock from 'super/i-block/i-block';

import type { TreeitemParams } from 'core/component/directives/aria/roles-engines/treeitem/interface';
import { AriaRoleEngine, KeyCodes, EngineOptions } from 'core/component/directives/aria/roles-engines/interface';

export class TreeitemEngine extends AriaRoleEngine {
	/**
	 * Engine params
	 */
	override params: TreeitemParams;

	/** @see [[AriaRoleEngine.ctx]] */
	override ctx?: iBlock & iAccess;

	/**
	 * Engine params list
	 */
	static override params: string[] = ['isFirstRootItem', 'isExpandable', 'isExpanded', 'orientation', 'rootElement', 'toggleFold'];

	constructor(options: EngineOptions<TreeitemParams>) {
		super(options);

		if (!iAccess.is(this.ctx)) {
			Object.throw('Treeitem aria directive expects the component to realize iAccess interface');
		}

		this.params = options.params;
	}

	/**
	 * Sets base aria attributes for current role
	 */
	init(): void {
		this.async?.on(this.el, 'keydown', this.onKeyDown.bind(this));

		const
			isMuted = this.ctx?.removeAllFromTabSequence(this.el);

		if (this.params.isFirstRootItem) {
			if (isMuted) {
				this.ctx?.restoreAllToTabSequence(this.el);

			} else {
				this.el.tabIndex = 0;
			}
		}

		this.el.setAttribute('role', 'treeitem');

		this.ctx?.$nextTick(() => {
			if (this.params.isExpandable) {
				this.el.setAttribute('aria-expanded', String(this.params.isExpanded));
			}
		});
	}

	/**
	 * Changes focus from the current focused element to the passed one
	 * @param el
	 */
	protected focusNext(el: AccessibleElement): void {
		this.ctx?.removeAllFromTabSequence(this.el);
		this.ctx?.restoreAllToTabSequence(el);

		el.focus();
	}

	/**
	 * Moves focus to the next or previous focusable element via the step parameter
	 * @param step
	 */
	protected moveFocus(step: 1 | -1): void {
		const
			nextEl = this.ctx?.getNextFocusableElement(step);

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
			focusableParent = this.ctx?.findFocusableElement(parent);

		if (focusableParent != null) {
			this.focusNext(focusableParent);
		}
	}

	/**
	 * Moves focus to the first visible treeitem
	 */
	protected setFocusToFirstItem(): void {
		const
			firstItem = this.ctx?.findFocusableElement(this.params.rootElement);

		if (firstItem != null) {
			this.focusNext(firstItem);
		}
	}

	/**
	 * Moves focus to the last visible treeitem
	 */
	protected setFocusToLastItem(): void {
		const
			items = this.ctx?.findFocusableElements(this.params.rootElement);

		if (items == null) {
			return;
		}

		let
			lastItem: CanUndef<AccessibleElement>;

		for (const item of items) {
			lastItem = item;
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

		const
			isHorizontal = this.params.orientation === 'horizontal';

		const open = () => {
			if (this.params.isExpandable) {
				if (this.params.isExpanded) {
					this.moveFocus(1);

				} else {
					this.openFold();
				}
			}
		};

		const close = () => {
			if (this.params.isExpandable && this.params.isExpanded) {
				this.closeFold();

			} else {
				this.focusParent();
			}
		};

		switch (e.key) {
			case KeyCodes.UP:
				if (isHorizontal) {
					close();
					break;
				}

				this.moveFocus(-1);
				break;

			case KeyCodes.DOWN:
				if (isHorizontal) {
					open();
					break;
				}

				this.moveFocus(1);
				break;

			case KeyCodes.RIGHT:
				if (isHorizontal) {
					this.moveFocus(1);
					break;
				}

				open();
				break;

			case KeyCodes.LEFT:
				if (isHorizontal) {
					this.moveFocus(-1);
					break;
				}

				close();
				break;

			case KeyCodes.ENTER:
				this.params.toggleFold(this.el);
				break;

			case KeyCodes.HOME:
				this.setFocusToFirstItem();
				break;

			case KeyCodes.END:
				this.setFocusToLastItem();
				break;

			default:
				return;
		}

		e.stopPropagation();
		e.preventDefault();
	}
}
