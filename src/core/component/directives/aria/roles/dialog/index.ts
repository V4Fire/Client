/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ARIARole, KeyCodes } from 'core/component/directives/aria/roles/interface';
import { DialogParams } from 'core/component/directives/aria/roles/dialog/interface';
import type iBlock from 'super/i-block/i-block';

export class Dialog extends ARIARole {
	override Params: DialogParams = new DialogParams();
	override Ctx!: iBlock['unsafe'];

	protected previousFocusedElement: Nullable<AccessibleElement>;
	protected focusableElements: AccessibleElement[] = [];

	/** @inheritDoc */
	async init(): Promise<void> {
		this.setAttribute('role', 'dialog');
		this.setAttribute('aria-modal', 'true');

		if (this.ctx == null) {
			return;
		}

		this.focusableElements = [...this.ctx.dom.findFocusableElements(this.el)];

		this.async.on(this.el, 'keydown', this.onKeydown.bind(this));

		await this.ctx.nextTick();

		const
			{label, labelledby} = this.params;

		if (label == null && labelledby == null && !this.el.hasAttribute('aria-labelledby')) {
			throw new TypeError('The `dialog` role expects a `label` or `labelledby` value to be passed');
		}
	}

	/**
	 * Handler: the dialog has been opened
	 */
	protected async onOpen(): Promise<void> {
		await this.ctx?.nextTick();

		if (this.previousFocusedElement == null) {
			this.previousFocusedElement = <AccessibleElement | null>document.activeElement;
		}

		this.ctx?.dom.removeAllFromTabSequence(document.body);
		this.ctx?.dom.restoreAllToTabSequence(this.el);
		this.ctx?.dom.findFocusableElement(this.el)?.focus();
	}

	/**
	 * Handler: the dialog has been closed
	 */
	protected async onClose(): Promise<void> {
		await this.ctx?.nextTick();

		this.ctx?.dom.restoreAllToTabSequence(document.body);

		this.previousFocusedElement?.focus();
		this.previousFocusedElement = null;
	}

	/**
	 * Handler: a keyboard event has occurred
	 */
	protected onKeydown(e: KeyboardEvent): void {
		if (e.key === KeyCodes.TAB) {

			if (document.activeElement === this.focusableElements.at(-1)) {
				this.focusableElements[0]?.focus();

				e.stopPropagation();
				e.preventDefault();
			}
		}
	}
}
