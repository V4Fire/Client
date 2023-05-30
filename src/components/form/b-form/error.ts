/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import BaseError from 'core/error';

import type iInput from 'components/super/i-input/i-input';
import type { ValidationError as InputValidationError } from 'components/super/i-input/i-input';

export default class ValidationError<D = undefined> extends BaseError {
	/**
	 * The error type
	 */
	readonly type: string;

	/**
	 * The component on which the error occurred
	 */
	readonly component: iInput;

	/**
	 * The error details
	 */
	readonly details: InputValidationError<D>;

	/**
	 * @param component
	 * @param details - the error details
	 */
	constructor(component: iInput, details: InputValidationError<D>) {
		super();

		this.type = details.error.name;
		this.component = component;
		this.details = details;
	}

	protected override format(): string {
		const
			parts = [this.details.message];

		const
			head = `[${this.component.globalName ?? this.component.componentName}] [${this.type}]`,
			body = parts.filter((p) => p != null).join(' ');

		if (body.length > 0) {
			return `${head} ${body}`;
		}

		return head;
	}
}
