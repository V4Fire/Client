/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bInput from 'form/b-input/b-input';
import type iInput from 'super/i-input/i-input';
import type { ValidatorsDecl, ValidatorParams, ValidatorResult } from 'super/i-input/i-input';

import type {

	NumberValidatorParams,
	NumberValidatorResult,

	DateValidatorParams,
	DateValidatorResult,

	PatternValidatorParams,
	PatternValidatorResult,

	PasswordValidatorParams,
	PasswordValidatorResult

} from 'form/b-input/modules/validators/interface';

export * from 'form/b-input/modules/validators/interface';

export default <ValidatorsDecl<bInput, unknown>>{
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

	//#endif
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
			value = String((await this.formValue) ?? '');

		if (!Object.isTruly(value)) {
			const
				{input} = this.unsafe.$refs;

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (input != null && (input.validity == null || input.validity.valid)) {
				return true;
			}
		}

		if (precision != null && !Number.isNatural(precision)) {
			throw new TypeError('The precision value can be defined only as a natural number');
		}

		const
			s = `[${Array.concat([], separator).join('')}]`,
			ss = `[${Array.concat([], styleSeparator).join('')}]`,
			pr = precision != null ? String(precision) : '';

		const error = (
			type: NumberValidatorResult['name'] = 'INVALID_VALUE',
			val: string | number = value,
			defMsg = t`The value is not a number`
		) => {
			const err = <NumberValidatorResult>{
				name: type,
				value: val
			};

			this.setValidationMsg(this.getValidatorMsg(err, msg, defMsg), showMsg);
			return <ValidatorResult<NumberValidatorResult>>err;
		};

		const
			d = `^\\d(?:\\d|${ss}(?=\\d|$))*`;

		switch (type) {
			case 'uint':
				if (!new RegExp(`^${d}$`).test(value)) {
					return error();
				}

				break;

			case 'int':
				if (!new RegExp(`^-?${d}$`).test(value)) {
					return error();
				}

				break;

			case 'ufloat':
				if (!new RegExp(`^${d}?(?:${s}\\d{0,${pr}}|$)`).test(value)) {
					return error();
				}

				break;

			default:
				if (!new RegExp(`^-?${d}?(?:${s}\\d{0,${pr}}|$)`).test(value)) {
					return error();
				}
		}

		const
			chunks = value.split(new RegExp(s));

		if (
			strictPrecision &&
			precision != null &&

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			chunks[1] != null && chunks[1].length !== precision
		) {
			return error('DECIMAL_LENGTH', precision, t`A decimal part should have ${precision} digits`);
		}

		const
			numValue = parseFloat(value.replace(new RegExp(s), '.'));

		if (min != null && numValue < min) {
			return error('MIN', min, t`A value must be at least ${min}`);
		}

		if (max != null && numValue > max) {
			return error('MAX', max, t`A value must be no more than ${max}`);
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
			src = await this.formValue;

		if (src === undefined || src === '') {
			return true;
		}

		const
			value = Date.create(src);

		const error = (
			type: DateValidatorResult['name'] = 'INVALID_VALUE',
			errorValue: Date | number = value,
			defMsg = t`Invalid date value`
		) => {
			const err = <DateValidatorResult>{
				name: type,
				value: errorValue
			};

			this.setValidationMsg(this.getValidatorMsg(err, msg, defMsg), showMsg);
			return <ValidatorResult<DateValidatorResult>>err;
		};

		if (isNaN(value.valueOf())) {
			return error();
		}

		const
			isPast = value.isPast(),
			isFuture = value.isFuture();

		if (past && !isPast) {
			return error('NOT_PAST', value, t`A date value must be in the past`);
		}

		if (past === false && isPast) {
			return error('IS_PAST', value, t`A date value can't be in the past`);
		}

		if (future && !isFuture) {
			return error('NOT_FUTURE', value, t`A date value must be in the future`);
		}

		if (future === false && isFuture) {
			return error('IS_FUTURE', value, t`A date value can't be in the future`);
		}

		min = min != null ? Date.create(min) : min;
		max = max != null ? Date.create(max) : min;

		if (Object.isDate(min) && !min.isBefore(value)) {
			return error('MIN', min, t`A date value must be at least ${min}`);
		}

		if (Object.isDate(max) && !max.isAfter(value)) {
			return error('MAX', max, t`A date value must be no more than ${max}`);
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
			value = String((await this.formValue) ?? '');

		let
			rgxp: CanUndef<RegExp>;

		if (Object.isString(pattern)) {
			rgxp = new RegExp(pattern);

		} else if (Object.isRegExp(pattern)) {
			rgxp = pattern;
		}

		const error = (
			type: PatternValidatorResult['name'] = 'INVALID_VALUE',
			errorValue: string | number = value,
			defMsg = t`Invalid characters`
		) => {
			const err = <PatternValidatorResult>{
				name: type,
				value: errorValue
			};

			this.setValidationMsg(this.getValidatorMsg(err, msg, defMsg), showMsg);
			return <ValidatorResult<PatternValidatorResult>>err;
		};

		if (rgxp != null && !rgxp.test(value)) {
			return error('INVALID_VALUE', value, t`Invalid characters`);
		}

		if (!skipLength) {
			if (min != null && value.length < min) {
				return error('MIN', min, t`Value length must be at least ${min} characters`);
			}

			if (max != null && value.length > max) {
				return error('MAX', max, t`Value length must be no more than ${max} characters`);
			}
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
			value = (await this.formValue)?.trim() ?? '';

		if (value !== '' && !/.+@.+/.test(value)) {
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
	 * @param connected
	 * @param old
	 * @param skipLength
	 * @param showMsg
	 */
	async password({
		msg,
		pattern = /^\w*$/,
		min = 6,
		max = 18,
		connected,
		old,
		skipLength,
		showMsg = true
	}: PasswordValidatorParams): Promise<ValidatorResult> {
		const
			value = String((await this.formValue) ?? '');

		const error = (
			type: PasswordValidatorResult['name'] = 'INVALID_VALUE',
			errorValue: string | number | [string, string] = value,
			defMsg = t`Invalid characters`
		) => {
			const err = <PasswordValidatorResult>{
				name: type,
				value: errorValue
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
			return error('INVALID_VALUE', value, t`Invalid characters`);
		}

		if (!skipLength) {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (min != null && value.length < min) {
				return error('MIN', min, t`Password length must be at least ${min} characters`);
			}

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (max != null && value.length > max) {
				return error('MAX', max, t`Password length must be no more than ${max} characters`);
			}
		}

		const
			{dom} = this.unsafe;

		if (old != null) {
			const
				connectedInput = dom.getComponent<iInput>(old);

			if (connectedInput == null) {
				throw new ReferenceError(`Can't find a component by the provided selector "${old}"`);
			}

			const
				connectedValue = await connectedInput.formValue;

			if (Object.isTruly(connectedValue)) {
				if (connectedValue === value) {
					return error('OLD_IS_NEW', value, t`The old and new password are the same`);
				}

				void connectedInput.setMod('valid', true);
			}
		}

		if (connected != null) {
			const
				connectedInput = dom.getComponent<iInput>(connected);

			if (connectedInput == null) {
				throw new ReferenceError(`Can't find a component by the provided selector "${old}"`);
			}

			const
				connectedValue = await connectedInput.formValue;

			if (Object.isTruly(connectedValue)) {
				if (connectedValue !== value) {
					return error('NOT_CONFIRM', [value, String(connectedValue)], t`Passwords don't match`);
				}

				void connectedInput.setMod('valid', true);
			}
		}

		return true;
	}

	//#endif
};
