/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iInput from 'components/super/i-input/i-input';

import type { ValidationError as InputValidationError } from 'components/super/i-input/i-input';
import type { RequestError, RequestQuery, RequestBody } from 'components/super/i-data/i-data';

import type bForm from 'components/form/b-form/b-form';

export interface ValidateOptions {
	focusOnError?: boolean;
}

export type SubmitBody =
	RequestQuery |
	RequestBody;

export interface SubmitCtx {
	elements: iInput[];
	form: bForm;
}

export type SubmitStatus = 'success' | 'fail' | 'empty';

export interface SubmitResult<D = unknown> {
	status: SubmitStatus;
	response: D | Error | RequestError | InputValidationError;
}

export interface ActionFn {
	(body: SubmitBody, ctx: SubmitCtx): void;
}
