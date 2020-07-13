/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import bCheckbox, {

	component,
	ValidatorsDecl,
	ValidatorParams,
	ValidatorResult

} from 'form/b-checkbox/b-checkbox';

export * from 'super/i-input/i-input';

@component({flyweight: true})
export default class bRadioButton extends bCheckbox {
	/** @override */
	static validators: ValidatorsDecl = {
		//#if runtime has iInput/validators

		async required({msg, showMsg = true}: ValidatorParams): Promise<ValidatorResult<boolean>> {
			const
				value = await this.groupFormValue;

			if (!value) {
				this.setValidationMsg(this.getValidatorMsg(false, msg, t`Required field`), showMsg);
				return false;
			}

			return true;
		}

		//#endif
	};

	/** @override */
	protected async onClick(e: Event): Promise<void> {
		await this.focus();

		if (await this.check()) {
			const
				ctx = <any>this;

			for (let els = await this.groupElements, i = 0; i < els.length; i++) {
				const
					el = els[i];

				if (el !== ctx && this.isComponent(el, bRadioButton)) {
					el.uncheck().catch(stderr);
				}
			}

			this.emit('actionChange', true);
		}
	}
}
