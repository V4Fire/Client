/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { UnsafeIData } from 'components/super/i-data/i-data';
import type iInput from 'components/super/i-input/i-input';

export interface ValidatorMessageFn {
	(err: ValidatorResult): string;
}

/**
 * An error message.
 * It can be passed as a simple string, a dictionary of strings where the keys represent error names,
 * or a function that takes an error object and returns a string.
 */
export type ValidatorMessage = Nullable<
	string |
	Dictionary<string> |
	ValidatorMessageFn
>;

export interface ValidatorParams extends Dictionary {
	/**
	 * The error message
	 */
	message?: ValidatorMessage;

	/**
	 * Should or should not show the error message
	 */
	showMessage?: boolean;
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

export type ValidatorResult<E = unknown> = CanNull<
	boolean |
	ValidatorError<E>
>;

export type ValidationResult<E = unknown> =
	boolean |
	ValidationError<E>;

export interface ValidationError<E = unknown> {
	validator: string;
	error: ValidatorError<E>;
	message?: string;
}

export type Validator = string | Dictionary<ValidatorParams> | [string, ValidatorParams];

export type ValidatorsDecl<CTX extends iInput = any, P extends ValidatorParams = any> = Dictionary<
	(this: CTX, params: P) => CanPromise<boolean | unknown>
>;

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
