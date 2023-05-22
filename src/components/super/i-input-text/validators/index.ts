/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iInputText from 'components/super/i-input-text/i-input-text';

import type {

	ValidatorsDecl,
	ValidatorParams,
	ValidatorResult

} from 'components/super/i-input/i-input';

import type {

	PatternValidatorParams,
	PatternValidatorResult

} from 'components/super/i-input-text/validators/interface';

export * from 'components/super/i-input-text/validators/interface';

export default <ValidatorsDecl<iInputText>>{
	/** {@link iInput.validators.required} */
	async required({message, showMessage = true}: ValidatorParams): Promise<ValidatorResult<boolean>> {
		const
			value = await this.formValue;

		if (value === undefined || value === '') {
			this.setValidationMessage(this.getValidatorMessage(false, message, this.t`Required field`), showMessage);
			return false;
		}

		return true;
	},

	/**
	 * Checks that the component value must match the provided pattern
	 *
	 * @param message
	 * @param pattern
	 * @param min
	 * @param max
	 * @param skipLength
	 * @param showMessage
	 */
	async pattern({
		message,
		pattern,
		min,
		max,
		skipLength,
		showMessage = true
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
			defMsg = this.t`The text must match the pattern`
		) => {
			const err = <PatternValidatorResult>{
				name: type,
				value,

				// Skip undefined values
				params: Object.mixin(false, {}, {pattern, min, max, skipLength})
			};

			this.setValidationMessage(this.getValidatorMessage(err, message, defMsg), showMessage);
			return <ValidatorResult<PatternValidatorResult>>err;
		};

		if (rgxp != null && !rgxp.test(value)) {
			return error();
		}

		if (!skipLength) {
			const
				{length} = [...value.letters()];

			if (min != null && length < min) {
				return error('MIN', this.t('The text length must be at least {min} characters', {min}));
			}

			if (max != null && length > max) {
				return error('MAX', this.t('The text length must be no more than {max} characters', {max}));
			}
		}

		return true;
	}
};
