'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Store from 'core/store';
import { r } from 'core/request';
import { name, password } from 'core/const/validation';

export const
	$$ = new Store();

const
	group = 'validation';

export default {
	/** @this {bInput} */
	async name({msg, skipLength, showMsg = true}): boolean {
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

	/** @this {bInput} */
	async nameNotExists({url, msg, own, showMsg = true}): boolean {
		const
			value = await this.formValue;

		if (own !== undefined && own === value) {
			return true;
		}

		return new Promise((resolve) => {
			this.async.setTimeout({
				group,
				label: $$.nameNotExists,
				onClear: () => resolve(false),
				fn: async () => {
					try {
						const {responseData: {result}} = await this.async.request(r(url, {value}), {
							group,
							label: $$.nameNotExists
						});

						if (result === true && showMsg) {
							this.error = msg || t`This name is already taken`;
						}

						resolve(result !== true);

					} catch (err) {
						if (showMsg) {
							this.error = this.getDefaultErrorText(err);
						}

						resolve(err.type !== 'abort' ? false : null);
					}
				}

			}, 0.3.second());
		});
	},

	/** @this {bInput} */
	async email({msg, showMsg = true}): boolean {
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

	/** @this {bInput} */
	async emailNotExists({url, msg, own, showMsg = true}): boolean {
		const
			value = await this.formValue;

		if (own !== undefined && own === value) {
			return true;
		}

		return new Promise((resolve) => {
			this.async.setTimeout({
				group,
				label: $$.emailNotExists,
				onClear: () => resolve(false),
				fn: async () => {
					try {
						const {responseData: {result}} = await this.async.request(r(url, {value}), {
							group,
							label: $$.emailNotExists
						});

						if (result === true && showMsg) {
							this.error = msg || t`This email is already taken`;
						}

						resolve(result !== true);

					} catch (err) {
						if (showMsg) {
							this.error = this.getDefaultErrorText(err);
						}

						resolve(err.type !== 'abort' ? false : null);
					}
				}

			}, 0.3.second());
		});
	},

	/** @this {bInput} */
	async password({msg, connected, old, skipLength, showMsg = true}): boolean {
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
				connectedInput = this.$(old),
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
				connectedInput = this.$(connected),
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

	/** @this {bInput} */
	async dateFromInput({msg, showMsg = true}): boolean {
		const
			value = await this.formValue;

		if (/[^\d.-:()]/.test(this.value)) {
			return false;
		}

		if (!Object.isDate(value) || isNaN(Date.parse(value))) {
			if (showMsg) {
				this.error = msg || t`Invalid date`;
			}

			return false;
		}

		return true;
	}
};
