/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ValidatorParams, ValidatorError } from 'super/i-input/i-input';

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
