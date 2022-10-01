/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iAccess from 'traits/i-access/i-access';
import type iBlock from 'super/i-block/i-block';

import { ARIARole, KeyCodes } from 'core/component/directives/aria/roles/interface';
import { ListboxParams } from 'core/component/directives/aria/roles/listbox/interface';

export class Listbox extends ARIARole {
	override Params: ListboxParams = new ListboxParams();
	override Ctx!: iBlock['unsafe'] & iAccess;

	options: CanUndef<AccessibleElement[]>;

	/** @inheritDoc */
	init(): void {
		const
			{standAlone, label, labelledby} = this.params;

		if (standAlone) {
			if (this.ctx == null) {
				return;
			}

			if (!iAccess.is(this.ctx)) {
				throw new TypeError('The `listbox` role requires that a component in whose context the directive is used implement the `iAccess` interface');
			}

			if (label == null && labelledby == null) {
				throw new TypeError('The `listbox` role expects a `label` or `labelledby` value to be passed');
			}

			void this.ctx.lfc.execCbAfterBlockReady(() => {
				const
					options = this.ctx?.block?.elements('item');

				if (options != null) {
					this.options = Array.from(<NodeListOf<AccessibleElement>>options);
				}

				this.options?.forEach((el) => {
					el.setAttribute('tabindex', '0');
					this.ctx?.removeAllFromTabSequence(el);
				});
			});
		}

		this.setAttribute('role', 'listbox');
		this.setAttribute('tabindex', standAlone ? '0' : '-1');

		this.async.on(this.el, 'keydown', this.onKeydown.bind(this));
	}

	/**
	 * Sets or deletes the id of active descendant element
	 */
	protected setARIAActive(el: Element | null): void {
		this.setAttribute('aria-activedescendant', el?.id ?? '');
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

		if (nextEl?.getAttribute('role') !== 'option') {
			return;
		}

		this.focusNext(nextEl);
		this.setARIAActive(nextEl);
	}

	/**
	 * Handler: a keyboard event has occurred
	 */
	protected onKeydown(e: KeyboardEvent): void {
		const
			isHorizontal = this.params.orientation === 'horizontal';

		switch (e.key) {
			case KeyCodes.LEFT:
				if (isHorizontal) {
					this.moveFocus(-1);
				}

				return;

			case KeyCodes.UP:
				if (isHorizontal) {
					return;
				}

				this.moveFocus(-1);
				break;

			case KeyCodes.RIGHT:
				if (isHorizontal) {
					this.moveFocus(1);
					break;
				}

				return;

			case KeyCodes.DOWN:
				if (isHorizontal) {
					return;
				}

				this.moveFocus(1);
				break;

			case KeyCodes.HOME:
				this.options?.[0]?.focus();
				break;

			case KeyCodes.END:
				this.options?.at(-1)?.focus();
				break;

			default:
				return;
		}

		e.stopPropagation();
		e.preventDefault();
	}
}
