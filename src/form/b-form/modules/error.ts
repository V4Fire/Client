/*!
 * V4Fire Core
 * https://github.com/V4Fire/Core
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Core/blob/master/LICENSE
 */

import { deprecated } from 'core/functools/deprecation';
import iInput, { ValidationError as InputValidationError } from 'super/i-input/i-input';

/**
 * Class to wrap a validation error
 */
export default class ValidationError<D = undefined> implements Error {
	/**
	 * Error name
	 */
	readonly name: string = 'ValidationError';

	/**
	 * Validation error type
	 */
	readonly type: string;

	/**
	 * Validation message
	 */
	readonly message: string;

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
		this.component = component;
		this.details = details;
		this.type = details.error.name;
		this.message = details.msg ?? '';
	}
}
