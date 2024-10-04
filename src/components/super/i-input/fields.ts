/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { Option } from 'core/prelude/structures';

import iAccess from 'components/traits/i-access/i-access';
import { component, field, system, ComponentConverter } from 'components/super/i-data/i-data';

import type iInput from 'components/super/i-input/i-input';
import iInputProps from 'components/super/i-input/props';

import type {

	ValidatorsDecl,

	Validator,
	ValidatorResult,

	ValidatorParams,
	CustomValidatorParams

} from 'components/super/i-input/interface';

@component({partial: 'iInput'})
export default abstract class iInputFields extends iInputProps {
	/**
	 * A list of component value(s) that cannot be submitted via the associated form
	 * {@link iInputFields.disallowProp}
	 */
	@system((o) => o.sync.link((val) => {
		const iter = Object.isIterable(val) && !Object.isString(val) ? [...val] : val;
		return Array.concat([], iter);
	}))

	disallow!: Array<this['Value'] | Function | RegExp>;

	/**
	 * A list of component value converter(s) to form value
	 * {@link iInputFields.formValueConverter}
	 */
	@system((o) => o.sync.link('formValueConverter', (val) => Array.concat([], Object.isIterable(val) ? [...val] : val)))
	formValueConverters!: ComponentConverter[];

	/**
	 * A list of converters that are used by the associated form
	 * {@link iInputFields.formConverter}
	 */
	@system((o) => o.sync.link('formConverter', (val) => Array.concat([], Object.isIterable(val) ? [...val] : val)))
	formConverters!: ComponentConverter[];

	/**
	 * A list of validators for checking component value.
	 * If any of the validators returns a value other than true, the corresponding form will not submit data.
	 * {@link iInputFields.validatorsProp}
	 */
	@system((o) => o.sync.link((val) => Array.concat([], Object.isIterable(val) ? [...val] : val)))
	validators!: Validator[];

	/**
	 * Previous value of the component
	 */
	@system()
	prevValue?: this['Value'];

	/**
	 * A map of available component validators
	 */
	get validatorsMap(): typeof iInputFields['validators'] {
		return (<typeof iInputFields>this.instance.constructor).validators;
	}

	/**
	 * A link to the form associated with the component
	 */
	get connectedForm(): CanPromise<CanNull<HTMLFormElement>> {
		return this.waitComponentStatus('ready', () => {
			let
				form: Nullable<HTMLFormElement>;

			if (this.form != null) {
				form = document.querySelector<HTMLFormElement>(`#${this.form}`);

			} else {
				form = this.$el?.closest('form');
			}

			return form ?? null;
		});
	}

	/**
	 * The value of the component
	 * {@link iInputProps.valueProp}
	 */
	get value(): this['Value'] {
		return this.field.get('valueStore');
	}

	/**
	 * Sets a new component value
	 * @param value
	 */
	set value(value: this['Value']) {
		this.field.set('valueStore', value);
	}

	/**
	 * The default value of the component.
	 * This value will be used if no `value` is specified for the property or after calling the `reset` method.
	 * {@link iInputProps.defaultProp}
	 */
	get default(): this['Value'] {
		return this.defaultProp;
	}

	/**
	 * The form value of the component.
	 * The getter always returns a promise.
	 *
	 * According to the design, all `iInput` components have their own "individual" values and "form" values.
	 * The form value is based on the component's individual value, but in simple cases they are equal.
	 * The form associated with this component will use the form value, but not the original one.
	 *
	 * When getting the form value, the functions passed to `disallow` are first applied to
	 * the component's individual value.
	 * If any of these functions return true, then the form value will be undefined.
	 * Next, the functions passed to `formValueConverter` will be applied to the obtained value (if allowed) and
	 * the result will be returned.
	 */
	get formValue(): Promise<this['FormValue']> {
		return (async () => {
			await this.nextTick();

			const
				test = Array.concat([], this.disallow),
				value = await this.value;

			const match = (el: unknown): boolean => {
				if (Object.isFunction(el)) {
					return el.call(this, value);
				}

				if (Object.isRegExp(el)) {
					return el.test(String(value));
				}

				return el === value;
			};

			for (let i = 0; i < test.length; i++) {
				if (match(test[i])) {
					return undefined;
				}
			}

			const
				converters = this.formValueConverters;

			let
				convertedValue: CanUndef<typeof value> = value;

			for (let i = 0; i < converters.length; i++) {
				const
					validation = converters[i].call(this, convertedValue, this);

				if (validation instanceof Option) {
					convertedValue = await validation.catch(() => undefined);

				} else {
					convertedValue = await validation;
				}
			}

			return convertedValue;
		})();
	}

	/**
	 * A list of component form values.
	 * The values are taken from components with the same `name` attribute that are associated
	 * with the same form. The getter always returns a promise.
	 * {@link iInputFields.formValue}
	 */
	get groupFormValue(): Promise<Array<this['FormValue']>> {
		return (async () => {
			const
				values: Array<this['FormValue']> = [],
				tasks: Array<Promise<void>> = [];

			for (const el of await this.groupElements) {
				tasks.push((async () => {
					const
						v = await el.formValue;

					if (v !== undefined) {
						values.push(v);
					}
				})());
			}

			await Promise.all(tasks);
			return values;
		})();
	}

	/**
	 * A list of components with the same `name` attribute that are associated with the same form
	 */
	get groupElements(): CanPromise<readonly iInput[]> {
		const
			{name} = this;

		if (name != null) {
			return this.waitComponentStatus('ready', () => {
				const
					form = this.connectedForm,
					els: iInput[] = [];

				document.getElementsByName(name).forEach((el) => {
					const
						component = this.dom.getComponent<iInput>(el, '[class*="_form_true"]');

					if (component != null && form === component.connectedForm) {
						els.push(component);
					}
				});

				return Object.freeze(els);
			});
		}

		return Object.cast(Object.freeze([this]));
	}

	/**
	 * Information message that the component should display.
	 * Logically, this option is very similar to displaying STDIN in Unix.
	 */
	get info(): CanUndef<string> {
		return this.infoStore;
	}

	/**
	 * Sets a new information message
	 * @param value
	 */
	set info(value: CanUndef<string>) {
		this.infoStore = value;

		if (this.messageHelpers) {
			void this.waitComponentStatus('ready', () => {
				const
					box = this.block?.element('info-box');

				if (box?.children[0] != null) {
					box.children[0].innerHTML = this.infoStore ?? '';
				}
			});
		}
	}

	/**
	 * Error message that the component should display.
	 * Logically, this option is very similar to displaying STDERR in Unix.
	 */
	get error(): CanUndef<string> {
		return this.errorStore;
	}

	/**
	 * Sets a new error message
	 * @param value
	 */
	set error(value: CanUndef<string>) {
		this.errorStore = value;

		if (this.messageHelpers) {
			void this.waitComponentStatus('ready', () => {
				const
					box = this.block?.element('error-box');

				if (box?.children[0] != null) {
					box.children[0].innerHTML = this.errorStore ?? '';
				}
			});
		}
	}

	/** {@link iAccess.prototype.isFocused} */
	get isFocused(): boolean {
		const
			{input} = this.$refs;

		if (input != null) {
			return document.activeElement === input;
		}

		return iAccess.isFocused(this);
	}

	/**
	 * A map of available component validators
	 */
	static validators: ValidatorsDecl = {
		/**
		 * Checks that the component value must be filled
		 *
		 * @param opts
		 * @param opts.message
		 * @param [opts.showMessage]
		 */
		async required({message, showMessage = true}: ValidatorParams): Promise<ValidatorResult<boolean>> {
			if (await this.formValue === undefined) {
				this.setValidationMessage(this.getValidatorMessage(false, message, this.t`Required field`), showMessage);
				return false;
			}

			return true;
		},

		/**
		 * Invokes the specified custom validator function with additional provided parameters
		 *
		 * @param params - an object containing the validator function
		 *   and other validation parameters
		 *
		 * @param params.validator - the custom validation function that will be invoked
		 *   with the rest of the parameters
		 *
		 * @throws {Error} if the validator function is not provided
		 */
		async custom(params: CustomValidatorParams): Promise<ValidatorResult> {
			const {validator, ...rest} = params;

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (validator == null) {
				throw new Error('The `custom` validator must accept the validator function, but it was not provided');
			}

			const
				result = await validator(rest);

			if (Object.isBoolean(result) || Object.isNull(result)) {
				return result;
			}

			return {
				name: 'custom',
				value: result
			};
		}
	};

	/**
	 * Additional attributes that are provided to the native form control within the component
	 * {@link iInput.attrsProp}
	 */
	@system((o) => o.sync.link())
	protected attrs?: Dictionary;

	/** {@link iInput.info} */
	@system((o) => o.sync.link())
	protected infoStore?: string;

	/** {@link iInput.error} */
	@system((o) => o.sync.link())
	protected errorStore?: string;

	/** @inheritDoc */
	declare protected readonly $refs: iInputProps['$refs'] & {
		input?: HTMLInputElement;
	};

	/** {@link iInput.value} */
	@field<iInput>((o) => {
		o.watch('modelValue', (val: unknown) => o.value = val);
		return o.sync.link((val) => o.resolveValue(o.modelValue ?? val));
	})

	protected valueStore!: unknown;

	/**
	 * The normalized value for use with the `v-model` directive
	 */
	protected get valueModel(): string {
		return String(this.value ?? '');
	}

	/**
	 * Sets a new normalized value from the `v-model` directive
	 * @param value
	 */
	protected set valueModel(value: string) {
		this.value = value;
	}
}
