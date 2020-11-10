/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { RequestError } from 'core/request';
import { RequestQuery, RequestBody } from 'super/i-data/i-data';

import iInput from 'super/i-input/i-input';
import bForm from 'form/b-form/b-form';
import ValidationError from 'form/b-form/modules/error';

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
	response: D | Error | RequestError | ValidationError;
}

export interface ActionFn {
	(body: SubmitBody, ctx: SubmitCtx): void;
}
