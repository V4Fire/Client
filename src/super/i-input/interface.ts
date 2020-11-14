/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { UnsafeIData } from 'super/i-data/i-data';

import iInput from 'super/i-input/i-input';

export interface ValidatorMsgFn {
	(err: ValidatorResult): string;
}

export type ValidatorMsg = Nullable<
	string |
	Dictionary<string> |
	ValidatorMsgFn
>;

export interface ValidatorParams extends Dictionary {
	msg?: ValidatorMsg;
	showMsg?: boolean;
}

export interface ValidatorError<E = unknown> extends Dictionary {
	name: string;
	value?: E;
}

export type ValidatorResult<ERR = unknown> =
	boolean |
	null |
	ValidatorError<ERR>;

export interface ValidationError<E = unknown> {
	validator: string;
	error: ValidatorError<E>;
	msg?: string;
}

export type ValidationResult<ERR = unknown> =
	boolean |
	ValidationError<ERR>;

export type Validators = Array<
	string |
	Dictionary<ValidatorParams> |
	[string, ValidatorParams]
>;

export type ValidatorsDecl<CTX = iInput, P = ValidatorParams> = Dictionary<
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
