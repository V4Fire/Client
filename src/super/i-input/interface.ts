/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iInput from 'super/i-input/i-input';

export type ValidatorMsg = Nullable<
	string |
	Dictionary<string> |
	((err: ValidatorResult) => string)
>;

export interface ValidatorParams extends Dictionary {
	msg?: ValidatorMsg;
	showMsg?: boolean;
}

export interface ValidatorError<T = unknown> extends Dictionary {
	name: string;
	value?: T;
}

export type ValidatorResult<T = unknown> =
	boolean |
	null |
	ValidatorError<T>;

export interface ValidationError<T = unknown> {
	validator: string;
	error: ValidatorError<T>;
	msg?: string;
}

export type ValidationResult<T = unknown> = boolean | ValidationError<T>;
export type Validators = Array<string | Dictionary<ValidatorParams> | [string, ValidatorParams]>;
export type ValidatorsDecl<T = iInput, P = ValidatorParams> = Dictionary<(this: T, params: P) =>
	CanPromise<boolean | unknown>>;

export type Value = unknown;
export type FormValue = Value;
