/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ValidatorParams, ValidatorError } from '@src/super/i-input/i-input';

/**
 * Parameters to validate inputted strings
 */
export interface PatternValidatorParams extends ValidatorParams {
	/***
	 * RegExp or RegExp text to validate a string
	 */
	pattern?: RegExp | string;

	/**
	 * The minimum number of characters within a string
	 */
	min?: number;

	/**
	 * The maximum number of characters within a string
	 */
	max?: number;

	/**
	 * If true, the specified `min` and `max` values are ignored
	 */
	skipLength?: boolean;
}

export interface PatternValidatorResult extends ValidatorError<string | number> {
	name: 'NOT_MATCH' | 'MIN' | 'MAX';
}
