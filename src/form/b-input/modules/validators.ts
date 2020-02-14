/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import bInput from 'form/b-input/b-input';
import iInput, { ValidatorsDecl, ValidatorParams, ValidatorResult, ValidatorError } from 'super/i-input/i-input';

export interface NumberValidatorParams extends ValidatorParams {
	type?: 'int' | 'uint' | 'float' | 'ufloat';
	min?: number;
	max?: number;
	precision?: number;
	strictPrecision?: boolean;
	separator?: CanArray<string>;
	styleSeparator?: CanArray<string>;
}

export interface NumberValidatorResult extends ValidatorError<string | number> {
	name: 'INVALID_VALUE' | 'DECIMAL_LENGTH' | 'MIN' | 'MAX';
}

export interface DateValidatorParams extends ValidatorParams {
	past?: boolean;
	future?: boolean;
	min?: Date | number | string;
	max?: Date | number | string;
}

export interface DateValidatorResult extends ValidatorError<Date | number> {
	name: 'INVALID_VALUE' | 'NOT_FUTURE' | 'IS_FUTURE' | 'NOT_PAST' | 'IS_PAST' | 'MIN' | 'MAX';
}

export interface ConstPatternValidatorParams extends ValidatorParams {
	skipLength?: boolean;
}

export interface PatternValidatorParams extends ConstPatternValidatorParams {
	pattern?: RegExp | string;
	min?: number;
	max?: number;
}

export interface PatternValidatorResult extends ValidatorError<string | number> {
	name: 'INVALID_VALUE' | 'MIN' | 'MAX';
}

export interface PasswordValidatorParams extends PatternValidatorParams {
	connected?: string;
	old?: string;
}

export interface PasswordValidatorResult extends ValidatorError<string | number | [string, string]> {
	name: 'INVALID_VALUE' | 'MIN' | 'MAX' | 'OLD_IS_NEW' | 'NOT_CONFIRM';
}

export default <ValidatorsDecl<bInput, unknown>>{
	//#if runtime has iInput/validators

	async required({msg, showMsg = true}: ValidatorParams): Promise<ValidatorResult<boolean>> {
		if (!await this.formValue) {
			this.setValidationMsg(this.getValidatorMsg(false, msg, t`Required field`), showMsg);
			return false;
		}

		return true;
	},

	//#endif
	//#if runtime has bInput/validators

	async number({
		msg,
		type,
		min,
		max,
		precision,
		strictPrecision,
		separator = ['.', ','],
		styleSeparator = [],
		showMsg = true
	}: NumberValidatorParams): Promise<ValidatorResult<NumberValidatorResult>> {
		const
			value = (await this.formValue)?.trim() || '';

		if (!value) {
			const
				// @ts-ignore
				{input} = this.$refs;

			if (input && (!input.validity || input.validity.valid)) {
				return true;
			}
		}

		if (precision != null && precision <= 0) {
			throw new TypeError(`Invalid precision value "${precision}"`);
		}

		const
			s = `[${(<string[]>[]).concat(separator).join('')}]`,
			ss = `[${(<string[]>[]).concat(styleSeparator).join('')}]`,
			pr = precision ? String(precision) : '';

		const error = (
			type: NumberValidatorResult['name'] = 'INVALID_VALUE',
			val: string | number = value,
			defMsg = t`Value is not a number`
		) => {
			const err = <NumberValidatorResult>{
				name: type,
				value: val
			};

			this.setValidationMsg(this.getValidatorMsg(err, msg, defMsg), showMsg);
			return <ValidatorResult<NumberValidatorResult>>err;
		};

		const
			d = `^\\d(?:\\d|${ss})*`;

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
			chunks[1] != null && chunks[1].length !== precision
		) {
			return error('DECIMAL_LENGTH', precision, t`The decimal part should have ${precision} digits`);
		}

		const
			numValue = parseFloat(value.replace(new RegExp(s), '.'));

		if (min != null && numValue < min) {
			return error('MIN', min, t`Value must be at least ${min}`);
		}

		if (max != null && numValue > max) {
			return error('MAX', max, t`Value must be no more than ${max}`);
		}

		return true;
	},

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

		if (!src) {
			return true;
		}

		const
			value = Date.create(src);

		const error = (
			type: DateValidatorResult['name'] = 'INVALID_VALUE',
			val: Date | number = value,
			defMsg = t`Invalid date value`
		) => {
			const err = <DateValidatorResult>{
				name: type,
				value: val
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
			return error('NOT_PAST', value, t`Date isn't the past`);
		}

		if (past === false && isPast) {
			return error('IS_PAST', value, t`Date is the past`);
		}

		if (future && !isFuture) {
			return error('NOT_FUTURE', value, t`Date isn't the future`);
		}

		if (future === false && isFuture) {
			return error('IS_FUTURE', value, t`Date is the future`);
		}

		min = min != null ? Date.create(min) : min;
		max = max != null ? Date.create(max) : min;

		if (Object.isDate(min) && !min.isBefore(value)) {
			return error('MIN', min, t`Date must be at least ${min}`);
		}

		if (Object.isDate(max) && !max.isAfter(value)) {
			return error('MAX', max, t`Date must be no more than ${max}`);
		}

		return true;
	},

	async pattern({
		msg,
		pattern,
		min,
		max,
		skipLength,
		showMsg = true
	}: PatternValidatorParams): Promise<ValidatorResult> {
		const
			value = (await this.formValue) || '';

		let
			rgxp;

		if (Object.isString(pattern)) {
			rgxp = new RegExp(pattern);

		} else if (Object.isRegExp(pattern)) {
			rgxp = pattern;
		}

		const error = (
			type: PatternValidatorResult['name'] = 'INVALID_VALUE',
			val: string | number = value,
			defMsg = t`Invalid characters`
		) => {
			const err = <PatternValidatorResult>{
				name: type,
				value: val
			};

			this.setValidationMsg(this.getValidatorMsg(err, msg, defMsg), showMsg);
			return <ValidatorResult<PatternValidatorResult>>err;
		};

		if (rgxp && !rgxp.test(value)) {
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

	async email({msg, showMsg = true}: ValidatorParams): Promise<ValidatorResult<boolean>> {
		const
			value = (await this.formValue)?.trim();

		if (value && !/@/.test(value)) {
			this.setValidationMsg(this.getValidatorMsg(false, msg, t`Invalid email format`), showMsg);
			return false;
		}

		return true;
	},

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
			value = (await this.formValue) || '';

		const error = (
			type: PasswordValidatorResult['name'] = 'INVALID_VALUE',
			val: string | number | [string, string] = value,
			defMsg = t`Invalid characters`
		) => {
			const err = <PasswordValidatorResult>{
				name: type,
				value: val
			};

			this.setValidationMsg(this.getValidatorMsg(err, msg, defMsg), showMsg);
			return <ValidatorResult<PasswordValidatorResult>>err;
		};

		let
			rgxp;

		if (Object.isString(pattern)) {
			rgxp = new RegExp(pattern);

		} else if (Object.isRegExp(pattern)) {
			rgxp = pattern;
		}

		if (!rgxp) {
			throw new ReferenceError('Password pattern is not defined');
		}

		if (!rgxp.test(value)) {
			return error('INVALID_VALUE', value, t`Invalid characters.`);
		}

		if (!skipLength) {
			if (min != null && value.length < min) {
				return error('MIN', min, t`Password length must be at least ${min} characters`);
			}

			if (max != null && value.length > max) {
				return error('MAX', max, t`Password length must be no more than ${max} characters`);
			}
		}

		if (old) {
			const
				// @ts-ignore
				connectedInput = <iInput>this.$(old),
				connectedValue = connectedInput && await connectedInput.formValue;

			if (connectedValue) {
				if (connectedValue === value) {
					return error('OLD_IS_NEW', value, t`Old and new password are the same`);
				}

				connectedInput.setMod('valid', true);
			}
		}

		if (connected) {
			const
				// @ts-ignore
				connectedInput = <iInput>this.$(connected),
				connectedValue = connectedInput && await connectedInput.formValue;

			if (connectedValue) {
				if (connectedValue !== value) {
					return error('NOT_CONFIRM', [value, String(connectedValue)], t`Passwords don't match`);
				}

				connectedInput.setMod('valid', true);
			}
		}

		return true;
	}

	//#endif
};
