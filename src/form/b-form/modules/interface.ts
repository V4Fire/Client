/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bForm from 'form/b-form/b-form';

import type iInput from 'super/i-input/i-input';
import type { ValidationError as InputValidationError } from 'super/i-input/i-input';

import type { RequestQuery, RequestBody } from 'super/i-data/i-data';

export interface ValidationError<V = unknown> {
	el: iInput;
	validator: InputValidationError<V>;
}

export interface ValidateParams {
	focusOnError?: boolean;
}

export type SubmitBody =
	RequestQuery |
	RequestBody;

export interface SubmitCtx {
	elements: iInput[];
	form: bForm;
}

export interface ActionFn {
	(body: SubmitBody, ctx: SubmitCtx): void;
}
