/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import BaseError from '~/core/error';
import { deprecated } from '~/core/functools/deprecation';

import type iInput from '~/super/i-input/i-input';
import type { ValidationError as InputValidationError } from '~/super/i-input/i-input';

/**
 * Class to wrap a validation error
 */
export default class ValidationError<D = undefined> extends BaseError {
	/**
	 * Validation error type
	 */
	readonly type: string;

	/**
	 * A component on which the error occurred
	 */
	readonly component: iInput;

	/**
	 * Error details
	 */
	readonly details: InputValidationError<D>;

	/**
	 * @deprecated
	 * @see [[ValidationError.component]]
	 */
	@deprecated({renamedTo: 'component'})
	get el(): iInput {
		return this.component;
	}

	/**
	 * @deprecated
	 * @see [[ValidationError.details]]
	 */
	@deprecated({renamedTo: 'details'})
	get validator(): InputValidationError<D> {
		return this.details;
	}

	/**
	 * @param component
	 * @param details - error details
	 */
	constructor(component: iInput, details: InputValidationError<D>) {
		super();

		this.type = details.error.name;
		this.component = component;
		this.details = details;
	}

	protected override format(): string {
		const
			parts = [this.details.msg];

		const
			head = `[${this.component.globalName ?? this.component.componentName}] [${this.type}]`,
			body = parts.filter((p) => p != null).join(' ');

		if (body.length > 0) {
			return `${head} ${body}`;
		}

		return head;
	}
}
