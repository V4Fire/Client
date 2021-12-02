/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bInput from '~/form/b-input/b-input';
import type iInput from '~/super/i-input/i-input';

import type {

	ValidatorsDecl,
	ValidatorParams,
	ValidatorResult

} from '~/super/i-input/i-input';

import type {

	NumberValidatorParams,
	NumberValidatorResult,

	DateValidatorParams,
	DateValidatorResult,

	PasswordValidatorParams,
	PasswordValidatorResult

} from '~/form/b-input/modules/validators/interface';

export * from '~/form/b-input/modules/validators/interface';

export default <ValidatorsDecl<bInput>>{
	//#if runtime has bInput/validators

	/**
	 * Checks that a component value must be matched as a number
	 *
	 * @param msg
	 * @param type
	 * @param min
	 * @param max
	 * @param precision
	 * @param strictPrecision
	 * @param separator
	 * @param styleSeparator
	 * @param showMsg
	 */
	async number({
		msg,
		type,
		min,
		max,
		precision,
		strictPrecision,
		separator = ['.', ','],
		styleSeparator = [' ', '_'],
		showMsg = true
	}: NumberValidatorParams): Promise<ValidatorResult<NumberValidatorResult>> {
		const
			numStyleRgxp = new RegExp(`[${Array.concat([], styleSeparator).join('')}]`, 'g'),
			sepStyleRgxp = new RegExp(`[${Array.concat([], separator).join('')}]`);

		const value = String((await this.formValue) ?? '')
			.replace(numStyleRgxp, '')
			.replace(sepStyleRgxp, '.');

		if (value === '') {
			return true;
		}

		if (precision != null && !Number.isNatural(precision)) {
			throw new TypeError('The precision value can be defined only as a natural number');
		}

		const error = (
			defMsg = t`The value is not a number`,
			errorValue: string | number = value,
			errorType: NumberValidatorResult['name'] = 'INVALID_VALUE'
		) => {
			const err = <NumberValidatorResult>{
				name: errorType,
				value: errorValue,

				// Skip undefined values
				params: Object.mixin(false, {}, {
					type,

					min,
					max,

					precision,
					strictPrecision,

					separator,
					styleSeparator
				})
			};

			this.setValidationMsg(this.getValidatorMsg(err, msg, defMsg), showMsg);
			return <ValidatorResult<NumberValidatorResult>>err;
		};

		if (!/^-?\d*(?:\.\d*|$)/.test(value)) {
			return error();
		}

		const
			numValue = parseFloat(value);

		switch (type) {
			case 'uint':
				if (!Number.isNonNegative(numValue) || !Number.isInteger(numValue)) {
					return error(t`The value does not match with an unsigned integer type`, numValue);
				}

				break;

			case 'int':
				if (!Number.isInteger(numValue)) {
					return error(t`The value does not match with an integer type`, numValue);
				}

				break;

			case 'ufloat':
				if (!Number.isNonNegative(numValue)) {
					return error(t`The value does not match with an unsigned float type`, numValue);
				}

				break;

			default:
				// Do nothing
		}

		if (precision != null) {
			const
				chunks = value.split('.', 2);

			if (strictPrecision) {
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (chunks[1] == null || chunks[1].length !== precision) {
					return error(t`A decimal part should have ${precision} digits`, numValue, 'DECIMAL_LENGTH');
				}

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			} else if (chunks[1] != null && chunks[1].length > precision) {
				return error(t`A decimal part should have no more than ${precision} digits`, numValue, 'DECIMAL_LENGTH');
			}
		}

		if (min != null && numValue < min) {
			return error(t`A value must be at least ${min}`, numValue, 'MIN');
		}

		if (max != null && numValue > max) {
			return error(t`A value must be no more than ${max}`, numValue, 'MAX');
		}

		return true;
	},

	/**
	 * Checks that a component value must be matched as a date
	 *
	 * @param msg
	 * @param past
	 * @param future
	 * @param min
	 * @param max
	 * @param showMsg
	 */
	async date({
		msg,
		past,
		future,
		min,
		max,
		showMsg = true
	}: DateValidatorParams): Promise<ValidatorResult<DateValidatorResult>> {
		const
			value = await this.formValue;

		if (value === undefined || Object.isString(value) && value.trim() === '') {
			return true;
		}

		const
			dateValue = Date.create(isNaN(<any>value) ? value : Number(value));

		const error = (
			type: DateValidatorResult['name'] = 'INVALID_VALUE',
			defMsg = t`The value can't be parsed as a date`,
			errorValue: Date | string = dateValue
		) => {
			const err = <DateValidatorResult>{
				name: type,
				value: errorValue,

				// Skip undefined values
				params: Object.mixin(false, {}, {past, future, min, max})
			};

			this.setValidationMsg(this.getValidatorMsg(err, msg, defMsg), showMsg);
			return <ValidatorResult<DateValidatorResult>>err;
		};

		if (isNaN(dateValue.valueOf())) {
			return error(undefined, undefined, value);
		}

		const
			isPast = dateValue.isPast(),
			isFuture = dateValue.isFuture();

		if (past && !isPast) {
			return error('NOT_PAST', t`A date value must be in the past`);
		}

		if (past === false && isPast) {
			return error('IS_PAST', t`A date value can't be in the past`);
		}

		if (future && !isFuture) {
			return error('NOT_FUTURE', t`A date value must be in the future`);
		}

		if (future === false && isFuture) {
			return error('IS_FUTURE', t`A date value can't be in the future`);
		}

		if (min != null && !dateValue.isAfter(min, 1)) {
			return error('MIN', t`A date value must be at least "${min}"`);
		}

		if (max != null && !dateValue.isBefore(max, 1)) {
			return error('MAX', t`A date value must be no more than "${max}"`);
		}

		return true;
	},

	/**
	 * Checks that a component value must be matched as an email string
	 *
	 * @param msg
	 * @param showMsg
	 */
	async email({msg, showMsg = true}: ValidatorParams): Promise<ValidatorResult<boolean>> {
		const
			value = String((await this.formValue) ?? '');

		if (value === '') {
			return true;
		}

		if (!/.+@.+/.test(value)) {
			this.setValidationMsg(this.getValidatorMsg(false, msg, t`Invalid email format`), showMsg);
			return false;
		}

		return true;
	},

	/**
	 * Checks that a component value must be matched as a password
	 *
	 * @param msg
	 * @param pattern
	 * @param min
	 * @param max
	 * @param confirmComponent
	 * @param oldPassComponent
	 * @param skipLength
	 * @param showMsg
	 */
	async password({
		msg,
		pattern = /^\w*$/,
		min = 6,
		max = 18,
		confirmComponent,
		oldPassComponent,
		skipLength,
		showMsg = true
	}: PasswordValidatorParams): Promise<ValidatorResult> {
		const
			value = String((await this.formValue) ?? '');

		if (value === '') {
			return true;
		}

		const error = (
			type: PasswordValidatorResult['name'] = 'NOT_MATCH',
			defMsg = t`A password must contain only allowed characters`,
			errorValue: string | number | [string, string] = value
		) => {
			const err = <PasswordValidatorResult>{
				name: type,
				value: errorValue,

				// Skip undefined values
				params: Object.mixin(false, {}, {
					pattern,
					min,
					max,
					confirmComponent,
					oldPassComponent,
					skipLength
				})
			};

			this.setValidationMsg(this.getValidatorMsg(err, msg, defMsg), showMsg);
			return <ValidatorResult<PasswordValidatorResult>>err;
		};

		let
			rgxp: CanUndef<RegExp>;

		if (Object.isString(pattern)) {
			rgxp = new RegExp(pattern);

		} else if (Object.isRegExp(pattern)) {
			rgxp = pattern;
		}

		if (rgxp == null) {
			throw new ReferenceError('A password pattern is not defined');
		}

		if (!rgxp.test(value)) {
			return error();
		}

		if (!skipLength) {
			const
				{length} = [...value.letters()];

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (min != null && length < min) {
				return error('MIN', t`Password length must be at least ${min} characters`);
			}

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (max != null && length > max) {
				return error('MAX', t`Password length must be no more than ${max} characters`);
			}
		}

		const
			{dom} = this.unsafe;

		if (oldPassComponent != null) {
			const
				connectedInput = dom.getComponent<iInput>(oldPassComponent);

			if (connectedInput == null) {
				throw new ReferenceError(`Can't find a component by the provided selector "${oldPassComponent}"`);
			}

			const
				connectedValue = String(await connectedInput.formValue ?? '');

			if (connectedValue !== '') {
				if (connectedValue === value) {
					return error('OLD_IS_NEW', t`The old and new password are the same`);
				}

				void connectedInput.setMod('valid', true);
			}
		}

		if (confirmComponent != null) {
			const
				connectedInput = dom.getComponent<iInput>(confirmComponent);

			if (connectedInput == null) {
				throw new ReferenceError(`Can't find a component by the provided selector "${confirmComponent}"`);
			}

			const
				connectedValue = String(await connectedInput.formValue ?? '');

			if (connectedValue !== '') {
				if (connectedValue !== value) {
					return error('NOT_CONFIRM', t`The passwords aren't match`, [value, String(connectedValue)]);
				}

				void connectedInput.setMod('valid', true);
			}
		}

		return true;
	}

	//#endif
};
