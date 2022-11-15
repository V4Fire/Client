/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ValidatorParams, ValidatorError, PatternValidatorParams } from 'components/super/i-input-text/i-input-text';

export interface NumberValidatorParams extends ValidatorParams {
	/**
	 * Type of supported numbers:
	 *
	 * 1. `int` - integer numbers;
	 * 2. `uint` - non-negative integer numbers;
	 * 3. `float` - numbers with floating point;
	 * 4. `ufloat` - non-negative numbers with floating point.
	 */
	type?: 'int' | 'uint' | 'float' | 'ufloat';

	/**
	 * The minimum number value
	 */
	min?: number;

	/**
	 * The maximum number value
	 */
	max?: number;

	/**
	 * The maximum length of digits after the decimal point
	 */
	precision?: number;

	/**
	 * If true, the length of numbers after the decimal point must exactly equal the provided precision
	 */
	strictPrecision?: boolean;

	/**
	 * Allowed characters to represent a floating point number separator
	 * @default `['.', ',']`
	 */
	separator?: CanArray<string>;

	/**
	 * Allowed characters to represent a stylish delimiter of the number integer part
	 * @default `[' ', '_']`
	 */
	styleSeparator?: CanArray<string>;
}

export interface NumberValidatorResult extends ValidatorError<string | number> {
	name:
		'INVALID_VALUE' |
		'DECIMAL_LENGTH' |
		'MIN' |
		'MAX';
}

export interface DateValidatorParams extends ValidatorParams {
	/**
	 * If true, the date can only refer to the past.
	 * If false, the date can only refer to the future/current.
	 */
	past?: boolean;

	/**
	 * If true, the date can only refer to the future.
	 * If false, the date can only refer to the past/current.
	 */
	future?: boolean;

	/**
	 * The minimum date value
	 */
	min?: Date | number | string;

	/**
	 * The maximum date value
	 */
	max?: Date | number | string;
}

export interface DateValidatorResult extends ValidatorError<Date | number> {
	name:
		'INVALID_VALUE' |
		'NOT_FUTURE' |
		'IS_FUTURE' |
		'NOT_PAST' |
		'IS_PAST' |
		'MIN' |
		'MAX';
}

export interface PasswordValidatorParams extends PatternValidatorParams {
	/**
	 * @inheritDoc
	 * @default `/^\w*$/`
	 */
	pattern?: RegExp | string;

	/**
	 * @inheritDoc
	 * @default `6`
	 */
	min?: number;

	/**
	 * @inheritDoc
	 * @default `18`
	 */
	max?: number;

	/**
	 * A selector to the component that contains the password, which must match the original
	 */
	confirmComponent?: string;

	/**
	 * A selector to the component containing the old password
	 */
	oldPassComponent?: string;
}

export interface PasswordValidatorResult extends ValidatorError<string | number | [string, string]> {
	name:
		'NOT_MATCH' |
		'MIN' |
		'MAX' |
		'OLD_IS_NEW' |
		'NOT_CONFIRM';
}
