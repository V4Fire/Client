/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iInputText from 'super/i-input-text/i-input-text';

import type {

	ValidatorsDecl,
	ValidatorParams,
	ValidatorResult

} from 'super/i-input/i-input';

import type {

	PatternValidatorParams,
	PatternValidatorResult

} from 'super/i-input-text/modules/validators/interface';

export * from 'super/i-input-text/modules/validators/interface';

export default <ValidatorsDecl<iInputText, unknown>>{
	//#if runtime has iInput/validators

	/** @see [[iInput.validators.required]] */
	async required({msg, showMsg = true}: ValidatorParams): Promise<ValidatorResult<boolean>> {
		const
			value = await this.formValue;

		if (value === undefined || value === '') {
			this.setValidationMsg(this.getValidatorMsg(false, msg, t`Required field`), showMsg);
			return false;
		}

		return true;
	},

	/**
	 * Checks that a component value must be matched to the provided pattern
	 *
	 * @param msg
	 * @param pattern
	 * @param min
	 * @param max
	 * @param skipLength
	 * @param showMsg
	 */
	async pattern({
		msg,
		pattern,
		min,
		max,
		skipLength,
		showMsg = true
	}: PatternValidatorParams): Promise<ValidatorResult> {
		const
			value = String(await this.formValue ?? '');

		if (value === '') {
			return true;
		}

		let
			rgxp: CanUndef<RegExp>;

		if (Object.isString(pattern)) {
			rgxp = new RegExp(pattern);

		} else if (Object.isRegExp(pattern)) {
			rgxp = pattern;
		}

		const error = (
			type: PatternValidatorResult['name'] = 'NOT_MATCH',
			defMsg = t`A value must match the pattern`
		) => {
			const err = <PatternValidatorResult>{
				name: type,
				value,

				// Skip undefined values
				params: Object.mixin(false, {}, {pattern, min, max, skipLength})
			};

			this.setValidationMsg(this.getValidatorMsg(err, msg, defMsg), showMsg);
			return <ValidatorResult<PatternValidatorResult>>err;
		};

		if (rgxp != null && !rgxp.test(value)) {
			return error();
		}

		if (!skipLength) {
			const
				{length} = [...value.letters()];

			if (min != null && length < min) {
				return error('MIN', t`Value length must be at least ${min} characters`);
			}

			if (max != null && length > max) {
				return error('MAX', t`Value length must be no more than ${max} characters`);
			}
		}

		return true;
	}

	//#endif
};
