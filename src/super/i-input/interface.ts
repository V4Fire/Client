/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { UnsafeIData } from 'super/i-data/i-data';
import type iInput from 'super/i-input/i-input';

export interface ValidatorMsgFn {
	(err: ValidatorResult): string;
}

/**
 * An error message to show a user.
 * It can be passed as a simple string, a dictionary of strings where the keys represent error names or a
 * function that takes an error object and returns a string.
 */
export type ValidatorMsg = Nullable<
	string |
	Dictionary<string> |
	ValidatorMsgFn
>;

export interface ValidatorParams extends Dictionary {
	/**
	 * Error message to show a user
	 */
	msg?: ValidatorMsg;

	/**
	 * Should show or not to show an error message to a user
	 */
	showMsg?: boolean;
}

export interface CustomValidatorParams<P extends ValidatorParams = any> extends ValidatorParams {
	/**
	 * A custom validator function
	 */
	validator: CustomValidator<P>;
}

type CustomValidator<P> = (params: P) => unknown;

export interface ValidatorError<E = unknown> extends Dictionary {
	name: string;
	value?: E;
	params?: Dictionary;
}

export type ValidatorResult<E = unknown> =
	boolean |
	null |
	ValidatorError<E>;

export interface ValidationError<E = unknown> {
	validator: string;
	error: ValidatorError<E>;
	msg?: string;
}

export type ValidationResult<E = unknown> =
	boolean |
	ValidationError<E>;

export type Validators = Array<
	string |
	Dictionary<ValidatorParams> |
	[string, ValidatorParams]
>;

export type ValidatorsDecl<CTX extends iInput = any, P extends ValidatorParams = any> = Dictionary<
	Validator<CTX, P>
>;

type Validator<CTX, P> = (this: CTX, params: P) => CanPromise<ValidatorResult>;

export type Value = unknown;
export type FormValue = Value;

// @ts-ignore (extend)
export interface UnsafeIInput<CTX extends iInput = iInput> extends UnsafeIData<CTX> {
	// @ts-ignore (access)
	attrs: CTX['attrs'];

	// @ts-ignore (access)
	resolveValue: CTX['resolveValue'];

	// @ts-ignore (access)
	normalizeAttrs: CTX['normalizeAttrs'];
}
