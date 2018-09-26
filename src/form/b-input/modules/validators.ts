/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import fetch from 'core/request';
import iInput, { ValidatorsDecl, ValidatorParams } from 'super/i-input/i-input';
import symbolGenerator from 'core/symbol';
import { name, password } from 'core/const/validation';

export const
	$$ = symbolGenerator(),
	DELAY = 0.3.second(),
	group = 'validation';

export interface ConstPatternValidatorParams extends ValidatorParams {
	skipLength?: boolean;
}

export interface PatternValidatorParams extends ConstPatternValidatorParams {
	pattern?: RegExp;
	minLength?: number;
	maxLength?: number;
	skipLength?: boolean;
}

export interface CheckExistsValidatorParams extends ValidatorParams {
	url: string;
	own?: any;
}

export interface PasswordValidatorParams extends ConstPatternValidatorParams {
	connected?: string;
	old?: string;
}

export default <ValidatorsDecl>{
	async required({msg, showMsg = true}: ValidatorParams): Promise<boolean> {
		if (!await this.formValue) {
			if (showMsg) {
				this.error = msg || t`Required field`;
			}

			return false;
		}

		return true;
	},

	async pattern({
		msg,
		pattern,
		minLength,
		maxLength,
		skipLength,
		showMsg = true
	}: PatternValidatorParams): Promise<boolean> {
		const
			value = await this.formValue;

		if (pattern && !pattern.test(value)) {
			if (showMsg) {
				this.error = msg || t`Invalid characters`;
			}

			return false;
		}

		if (!skipLength) {
			if (Object.isNumber(minLength) && value.length < minLength) {
				if (showMsg) {
					this.error = msg || t`Value length must be at least ${minLength} characters`;
				}

				return false;
			}

			if (Object.isNumber(maxLength) && value.length > maxLength) {
				if (showMsg) {
					this.error = msg || t`Value length must be no more than ${maxLength} characters`;
				}

				return false;
			}
		}

		return true;
	},

	async name({msg, skipLength, showMsg = true}: ConstPatternValidatorParams): Promise<boolean> {
		const
			value = await this.formValue;

		if (!name.pattern.test(value)) {
			if (showMsg) {
				this.error = msg ||
					t`Invalid characters. <br>Allowed only Latin characters, numbers and underscore`;
			}

			return false;
		}

		if (!skipLength) {
			if (value.length < name.min) {
				if (showMsg) {
					this.error = msg || t`Name length must be at least ${name.min} characters`;
				}

				return false;
			}

			if (value.length > name.max) {
				if (showMsg) {
					this.error = msg || t`Name length must be no more than ${name.max} characters`;
				}

				return false;
			}
		}

		return true;
	},

	async nameNotExists({url, msg, own, showMsg = true}: CheckExistsValidatorParams): Promise<boolean | null> {
		const
			value = await this.formValue;

		if (own !== undefined && own === value) {
			return true;
		}

		return new Promise<boolean | null>((resolve) => {
			// @ts-ignore
			this.async.setTimeout(async () => {
				try {
					// @ts-ignore
					const {result} = await this.async.request(fetch(url, {method: 'GET', query: {value}})(), {
						group,
						label: $$.nameNotExists
					});

					if (result === true && showMsg) {
						this.error = msg || t`This name is already taken`;
					}

					resolve(result !== true);

				} catch (err) {
					if (showMsg) {
						// @ts-ignore
						this.error = this.getDefaultErrorText(err);
					}

					resolve(err.type !== 'abort' ? false : null);
				}

			}, DELAY, {
				group,
				label: $$.nameNotExists,
				onClear: () => resolve(false)
			});
		});
	},

	async email({msg, showMsg = true}: ConstPatternValidatorParams): Promise<boolean | null> {
		const
			value = (await this.formValue).trim();

		if (value && !/@/.test(value)) {
			if (showMsg) {
				this.error = msg || t`Invalid email format`;
			}

			return false;
		}

		return true;
	},

	async emailNotExists({url, msg, own, showMsg = true}: CheckExistsValidatorParams): Promise<boolean | null> {
		const
			value = await this.formValue;

		if (own !== undefined && own === value) {
			return true;
		}

		return new Promise<boolean | null>((resolve) => {
			// @ts-ignore
			this.async.setTimeout(async () => {
				try {
					// @ts-ignore
					const {result} = await this.async.request(fetch(url, {method: 'GET', query: {value}}), {
						group,
						label: $$.emailNotExists
					});

					if (result === true && showMsg) {
						this.error = msg || t`This email is already taken`;
					}

					resolve(result !== true);

				} catch (err) {
					if (showMsg) {
						// @ts-ignore
						this.error = this.getDefaultErrorText(err);
					}

					resolve(err.type !== 'abort' ? false : null);
				}

			}, DELAY, {
				group,
				label: $$.emailNotExists,
				onClear: () => resolve(false)
			});
		});
	},

	async password({msg, connected, old, skipLength, showMsg = true}: PasswordValidatorParams): Promise<boolean> {
		const
			value = await this.formValue;

		if (!password.pattern.test(value)) {
			if (showMsg) {
				this.error = msg ||
					t`Invalid characters. <br>Allowed only Latin characters, numbers and underscore`;
			}

			return false;
		}

		if (!skipLength) {
			if (value.length < password.min) {
				if (showMsg) {
					this.error = msg || t`Password length must be at least ${password.min} characters`;
				}

				return false;
			}

			if (value.length > password.max) {
				if (showMsg) {
					this.error = msg || t`Password length must be no more than ${password.max} characters`;
				}

				return false;
			}
		}

		if (old) {
			const
				// @ts-ignore
				connectedInput = <iInput>this.$(old),
				connectedValue = connectedInput && await connectedInput.formValue;

			if (connectedValue) {
				if (connectedValue === value) {
					if (showMsg) {
						this.error = msg || t`Old and new password are the same`;
					}

					return false;
				}

				connectedInput.setMod('valid', true);
			}
		}

		if (connected) {
			const
				// @ts-ignore
				connectedInput = <iInput>this.$(connected),
				connectedValue = connectedInput && await connectedInput.formValue;

			if (connectedValue) {
				if (connectedValue !== value) {
					if (showMsg) {
						this.error = msg || t`Passwords don't match`;
					}

					return false;
				}

				connectedInput.setMod('valid', true);
			}
		}

		return true;
	},

	async dateFromInput({msg, showMsg = true}: ValidatorParams): Promise<boolean> {
		const
			value = await this.formValue;

		if (/[^\d.-:()]/.test(this.value)) {
			return false;
		}

		if (!Object.isDate(value) || isNaN(Date.parse(<any>value))) {
			if (showMsg) {
				this.error = msg || t`Invalid date`;
			}

			return false;
		}

		return true;
	}
};
