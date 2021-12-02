/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ValidatorParams, ValidatorError, PatternValidatorParams } from '~/super/i-input-text/i-input-text';

/**
 * Parameters to validate inputted numbers
 */
export interface NumberValidatorParams extends ValidatorParams {
	/**
	 * Type of supported numbers:
	 *
	 * *) `int` - integer numbers
	 * *) `uint` - non-negative integer numbers
	 * *) `float` - numbers with floating point
	 * *) `ufloat` - non-negative numbers with floating point
	 */
	type?: 'int' | 'uint' | 'float' | 'ufloat';

	/**
	 * The minimum value of a number
	 */
	min?: number;

	/**
	 * The maximum value of a number
	 */
	max?: number;

	/**
	 * The maximum length of numbers after a comma
	 */
	precision?: number;

	/**
	 * If true, the length of numbers after a comma should precisely equal to the provided precision
	 */
	strictPrecision?: boolean;

	/**
	 * Allowed symbols to represent the number floating point separator
	 * @default `['.', ',']`
	 */
	separator?: CanArray<string>;

	/**
	 * Allowed symbols to represent the stylish separator of a number integer part
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

/**
 * Parameters to validate inputted dates
 */
export interface DateValidatorParams extends ValidatorParams {
	/**
	 * If true, a date can refer only to the past.
	 * If false, a date can refer only to the future/current.
	 */
	past?: boolean;

	/**
	 * If true, a date can refer only to the future.
	 * If false, a date can refer only to the past/current.
	 */
	future?: boolean;

	/**
	 * The minimum value of a date
	 */
	min?: Date | number | string;

	/**
	 * The maximum value of a date
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

/**
 * Parameters to validate inputted passwords
 */
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
	 * Selector to a component that contains a password that should match the original
	 */
	confirmComponent?: string;

	/**
	 * Selector to a component that contains the old password
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
