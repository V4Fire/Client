/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/super/i-input/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';
import SyncPromise from 'core/promise/sync';

import { Option } from 'core/prelude/structures';

import State, { set } from 'components/friends/state';
import Block, { element } from 'components/friends/block';
import DOM, { getComponent } from 'components/friends/dom';

import iAccess from 'components/traits/i-access/i-access';
import iVisible from 'components/traits/i-visible/i-visible';

import iData, {

	component,

	prop,
	field,
	system,

	hook,
	wait,

	ModsDecl,
	ModEvent,
	UnsafeGetter,

	ComponentConverter

} from 'components/super/i-data/i-data';

import type {

	Value,
	FormValue,
	UnsafeIInput,

	Validator,
	ValidatorMessage,
	ValidatorParams,
	ValidatorResult,
	ValidationResult,
	ValidatorsDecl

} from 'components/super/i-input/interface';

import { unpackIf } from 'components/super/i-input/modules/helpers';

export * from 'components/super/i-data/i-data';
export * from 'components/super/i-input/modules/helpers';
export * from 'components/super/i-input/interface';

State.addToPrototype({set});
Block.addToPrototype({element});
DOM.addToPrototype({getComponent});

const
	$$ = symbolGenerator();

@component()
export default abstract class iInput extends iData implements iVisible, iAccess {
	/**
	 * Type: the component value
	 */
	readonly Value!: Value;

	/**
	 * Type: the component form value
	 */
	readonly FormValue!: FormValue;

	/**
	 * The component value
	 */
	@prop({required: false})
	readonly valueProp?: this['Value'];

	/** {@link iInput.valueProp} */
	@prop({required: false})
	readonly modelValue?: this['Value'];

	/**
	 * The component default value.
	 * This value will be used if no prop value is specified or after a call to the `reset` method.
	 */
	@prop({required: false})
	readonly defaultProp?: this['Value'];

	/**
	 * The value of the ID attribute for the component.
	 * As a rule, this attribute is set to a native form control inside a component.
	 * Thus, you can use it to integrate with a label or other form element.
	 *
	 * @example
	 * ```
	 * < b-input :id = 'my-input'
	 *
	 * < label for = my-input
	 *   The input label
	 * ```
	 */
	@prop({type: String, required: false})
	readonly id?: string;

	/**
	 * A string specifying a name for the form control.
	 * This name is submitted along with the control value when the form data is submitted.
	 * If you don't provide the name, your component will be ignored by the form.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname
	 *
	 * @example
	 * ```
	 * < form
	 *   < b-input :name = 'fname' | :value = 'Andrey'
	 *
	 *   /// After clicking, the form generates an object to submit with the values `{fname: 'Andrey'}`
	 *   < button type = submit
	 *     Submit
	 * ```
	 */
	@prop({type: String, required: false})
	readonly name?: string;

	/**
	 * A string specifying the `<form>` element with which the component is associated (that is, its form owner).
	 * This string value, if present, must match the id of a `<form>` element in the same document.
	 * If this attribute isn't specified, the component is associated with the nearest containing form, if any.
	 *
	 * The form prop lets you place a component anywhere in the document but have it included with a form elsewhere
	 * in the document.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefform
	 *
	 * @example
	 * ```
	 * < b-input :name = 'fname' | :form = 'my-form'
	 *
	 * < form id = my-form
	 *   < button type = submit
	 *     Submit
	 * ```
	 */
	@prop({type: String, required: false})
	readonly form?: string;

	/** {@link iAccess.autofocus} */
	@prop({type: Boolean, required: false})
	readonly autofocus?: boolean;

	/** {@link iAccess.tabIndex} */
	@prop({type: Number, required: false})
	readonly tabIndex?: number;

	/**
	 * Additional attributes that are provided to the native form control within the component
	 * {@link iInput.$refs.input}
	 */
	@prop({type: Object, required: false})
	readonly attrsProp?: Dictionary;

	/**
	 * Component value(s) that cannot be submitted via the associated form.
	 * If the component value matches with one of the denied conditions,
	 * the component form value will be set to undefined.
	 *
	 * The parameter can take a value or an iterable of values to disallow.
	 * You can also pass the parameter as a function or a regular expression.
	 *
	 * {@link iInput.formValue}
	 *
	 * @example
	 * ```
	 * /// Disallow values that contain only whitespaces
	 * < b-input :name = 'name' | :disallow = /^\s*$/
	 * ```
	 */
	@prop({required: false})
	readonly disallowProp?: CanIter<this['Value'] | Function | RegExp>;

	/**
	 * A list of component value(s) that cannot be submitted via the associated form
	 * {@link iInput.disallowProp}
	 */
	@system((o) => o.sync.link((val) => {
		const iter = Object.isIterable(val) && !Object.isString(val) ? [...val] : val;
		return Array.concat([], iter);
	}))

	disallow!: Array<this['Value'] | Function | RegExp>;

	/**
	 * Component value converter(s) to form value.
	 *
	 * You can provide one or more functions to convert the original value into a new form value.
	 * For instance, you have an input component. The original input value is a string, but you provide a function to
	 * parse that string into a Date object.
	 *
	 * ```
	 * < b-input :formValueConverter = toDate
	 * ```
	 *
	 * To provide more than one function, pass an iterable of functions. Functions from the iterable are called from left
	 * to right.
	 *
	 * ```
	 * < b-input :formValueConverter = [toDate, toUTC]
	 * ```
	 *
	 * Any converter can return a promise. In the case of an iterable of converters, they will wait for the previous call
	 * to resolve. Also, any transformer can return the `Maybe` monad. It helps to combine validators and converters.
	 *
	 * ```
	 * < b-input :validators = ['required'] | :formValueConverter = [toDate.option(), toUTC.toUTC()]
	 * ```
	 *
	 * {@link iInput.formValue}
	 */
	@prop({
		validator: (v) => v == null || Object.isFunction(v) || Object.isIterable(v),
		required: false
	})

	readonly formValueConverter?: CanIter<ComponentConverter>;

	/**
	 * A list of component value converter(s) to form value
	 * {@link iInput.formValueConverter}
	 */
	@system((o) => o.sync.link('formValueConverter', (val) => Array.concat([], Object.isIterable(val) ? [...val] : val)))
	formValueConverters!: ComponentConverter[];

	/**
	 * Converter(s) that is used by the associated form.
	 * The form applies these converters to the group form value of the component.
	 *
	 * To provide more than one function, pass an iterable of functions. Functions from the iterable are called from left
	 * to right.
	 *
	 * ```
	 * < b-input :formConverter = [toProtobuf, zip]
	 * ```
	 *
	 * Any converter can return a promise. In the case of a list of converters,
	 * they are waiting to resolve the previous invoking.
	 *
	 * Any converter can return a promise. In the case of an iterable of converters, they will wait for the previous call
	 * to resolve. Also, any transformer can return the `Maybe` monad. It helps to combine validators and converters.
	 *
	 * ```
	 * < b-input :validators = ['required'] | :formConverter = [toProtobuf.option(), zip.toUTC()]
	 * ```
	 */
	@prop({
		validator: (v) => v == null || Object.isFunction(v) || Object.isIterable(v),
		required: false
	})

	readonly formConverter: CanIter<ComponentConverter> = [unpackIf];

	/**
	 * A list of converters that are used by the associated form
	 * {@link iInput.formConverter}
	 */
	@system((o) => o.sync.link('formConverter', (val) => Array.concat([], Object.isIterable(val) ? [...val] : val)))
	formConverters!: ComponentConverter[];

	/**
	 * If false, then the component value won't be cached by the associated form.
	 * Caching means that if the component value hasn't changed since the last time the form was submitted,
	 * it won't be resubmitted.
	 */
	@prop(Boolean)
	readonly cache: boolean = true;

	/**
	 * An iterable of validators to validate the component value.
	 * If any of the validators return a value other than true, the associated form will not submit the data.
	 *
	 * @example
	 * ```
	 * < b-input :name = 'name' | :validators = ['required', ['pattern', {pattern: /^\d+$/}]]
	 * ```
	 */
	@prop({
		validator: (val) => val == null || Object.isIterable(val),
		required: false
	})

	readonly validatorsProp?: Iterable<Validator>;

	/**
	 * A list of validators to validate the component value.
	 * If any of the validators return a value other than true, the associated form will not submit the data.
	 * {@link iInput.validatorsProp}
	 */
	@system((o) => o.sync.link((val) => Array.concat([], Object.isIterable(val) ? [...val] : val)))
	validators!: Validator[];

	/**
	 * An informational message that the component should display.
	 * Logically, this option is very similar to the STDIN output from Unix.
	 *
	 * @example
	 * ```
	 * < b-input :info = 'This is required parameter'
	 * ```
	 */
	@prop({type: String, required: false})
	readonly infoProp?: string;

	/**
	 * An error message that the component should display.
	 * Logically, this option is very similar to the STDERR output from Unix.
	 *
	 * @example
	 * ```
	 * < b-input :error = 'This is required parameter'
	 * ```
	 */
	@prop({type: String, required: false})
	readonly errorProp?: string;

	/**
	 * If true, default markup is generated in the component template to display information/error messages
	 */
	@prop(Boolean)
	readonly messageHelpers: boolean = false;

	/** {@link iVisible.hideIfOffline} */
	@prop(Boolean)
	readonly hideIfOffline: boolean = false;

	/**
	 * The component previous value
	 */
	@system()
	prevValue?: this['Value'];

	override get unsafe(): UnsafeGetter<UnsafeIInput<this>> {
		return Object.cast(this);
	}

	/**
	 * A map of available component validators
	 */
	get validatorsMap(): typeof iInput['validators'] {
		return (<typeof iInput>this.instance.constructor).validators;
	}

	/**
	 * A link to the form associated with the component
	 */
	get connectedForm(): CanPromise<CanNull<HTMLFormElement>> {
		return this.waitComponentStatus('ready', () => {
			let
				form;

			if (this.form != null) {
				form = document.querySelector<HTMLFormElement>(`#${this.form}`);

			} else {
				form = this.$el?.closest('form');
			}

			return form ?? null;
		});
	}

	/**
	 * The component value
	 * {@link iInput.valueProp}
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
	 * The component default value
	 * {@link iInput.defaultProp}
	 */
	get default(): this['Value'] {
		return this.defaultProp;
	}

	/**
	 * The component form value.
	 * The getter always returns a promise.
	 *
	 * By design, all `iInput` components have their "own" values and "form" values.
	 * The form value is based on the own component value, but in the simple case they are equal.
	 * The form associated with this component will use the value of the form, but not the original.
	 *
	 * When getting a form value, the functions passed to `disallow` are first applied to a component own value.
	 * If either of these functions returns true, then the form value will be undefined.
	 * Further, the functions passed to `formValueConverter` will be applied to the received value (if it is allowed) and
	 * the result will be returned.
	 */
	get formValue(): Promise<this['FormValue']> {
		return (async () => {
			await this.nextTick();

			const
				test = Array.concat([], this.disallow),
				value = await this.value;

			const match = (el): boolean => {
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
	 * A list of form values. The values are taken from components with the same `name` attribute that are associated
	 * with the same form. The getter always returns a promise.
	 * {@link iInput.formValue}
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
	 * A list of components with the same `name` prop and associated with the same form
	 */
	get groupElements(): CanPromise<readonly iInput[]> {
		const
			{name} = this;

		if (name != null) {
			return this.waitComponentStatus('ready', () => {
				const
					form = this.connectedForm;

				const
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

		return Object.freeze([this]);
	}

	/**
	 * The informational message that the component should display.
	 * Logically, this option is very similar to the STDIN output from Unix.
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
	 * The error message that the component should display.
	 * Logically, this option is very similar to the STDERR output from Unix.
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

	static override readonly mods: ModsDecl = {
		...iAccess.mods,
		...iVisible.mods,

		form: [
			['true'],
			'false'
		],

		valid: [
			'true',
			'false'
		],

		showInfo: [
			'true',
			'false'
		],

		showError: [
			'true',
			'false'
		]
	};

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

	protected override readonly $refs!: iData['$refs'] & {
		input?: HTMLInputElement;
	};

	/** {@link iInput.value} */
	@field<iInput>((o) => {
		o.watch('modelValue', (val) => o.value = val);
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
	 * Sets the normalized value from the `v-model` directive
	 */
	protected set valueModel(value: string) {
		this.value = value;
	}

	/**
	 * Internal validation error message
	 */
	@system()
	private validationMessage?: string;

	/** {@link iAccess.prototype.enable} */
	enable(): Promise<boolean> {
		return iAccess.enable(this);
	}

	/** {@link iAccess.prototype.disable} */
	disable(): Promise<boolean> {
		return iAccess.disable(this);
	}

	/** {@link iAccess.prototype.focus} */
	@wait('ready', {label: $$.focus})
	focus(): Promise<boolean> {
		const
			{input} = this.$refs;

		if (input != null && !this.isFocused) {
			input.focus();
			return SyncPromise.resolve(true);
		}

		return SyncPromise.resolve(false);
	}

	/** {@link iAccess.prototype.blur} */
	@wait('ready', {label: $$.blur})
	blur(): Promise<boolean> {
		const
			{input} = this.$refs;

		if (input != null && this.isFocused) {
			input.blur();
			return SyncPromise.resolve(true);
		}

		return SyncPromise.resolve(false);
	}

	/**
	 * Clears the component value to undefined
	 * @emits `clear(value: this['Value'])`
	 */
	@wait('ready', {label: $$.clear})
	clear(): Promise<boolean> {
		if (this.value !== undefined) {
			this.value = undefined;
			this.async.clearAll({group: 'validation'});

			const emit = () => {
				void this.removeMod('valid');
				this.emit('clear', this.value);
				return true;
			};

			if (this.meta.systemFields.value != null) {
				return SyncPromise.resolve(emit());
			}

			return this.nextTick().then(emit);
		}

		return SyncPromise.resolve(false);
	}

	/**
	 * Resets the component value to its default value
	 * @emits `reset(value: this['Value'])`
	 */
	@wait('ready', {label: $$.reset})
	async reset(): Promise<boolean> {
		if (this.value !== this.default) {
			this.value = this.default;
			this.async.clearAll({group: 'validation'});

			const emit = () => {
				void this.removeMod('valid');
				this.emit('reset', this.value);
				return true;
			};

			if (this.meta.systemFields.value != null) {
				return SyncPromise.resolve(emit());
			}

			return this.nextTick().then(emit);
		}

		return SyncPromise.resolve(false);
	}

	/**
	 * Returns a validator error message based on passed parameters
	 *
	 * @param err - the error details
	 * @param message - the validator message object
	 * @param defaultMessage - the default error message
	 */
	getValidatorMessage(err: ValidatorResult, message: ValidatorMessage, defaultMessage: string): string {
		if (Object.isFunction(message)) {
			const m = message(err);
			return Object.isTruly(m) ? m : defaultMessage;
		}

		if (Object.isPlainObject(message)) {
			return (Object.isPlainObject(err) && Boolean(message[err.name])) ?
				message[err.name]! :
				defaultMessage;
		}

		return Object.isTruly(message) ? String(message) : defaultMessage;
	}

	/**
	 * Sets a new validation error message to the component
	 *
	 * @param message
	 * @param [showMessage] - if true, then the message will be provided to .error
	 */
	setValidationMessage(message: string, showMessage: boolean = false): void {
		this.validationMessage = message;

		if (showMessage) {
			this.error = message;
		}
	}

	/**
	 * Validates the component value.
	 * The method returns true if the validation is successful or an object with the error information.
	 *
	 * @param opts - additional options
	 *
	 * @emits `validationStart()`
	 * @emits `validationSuccess()`
	 * @emits `validationFail(failedValidation: ValidationError<this['FormValue']>)`
	 * @emits `validationEnd(success: boolean, failedValidation?: ValidationError<this['FormValue']>)`
	 */
	@wait('ready', {defer: true, label: $$.validate})
	async validate(opts?: ValidatorParams): Promise<ValidationResult<this['FormValue']>> {
		if (this.validators.length === 0) {
			void this.removeMod('valid');
			return true;
		}

		this.emit('validationStart');

		let
			valid,
			failedValidation;

		for (const decl of this.validators) {
			const
				isArray = Object.isArray(decl),
				isPlainObject = !isArray && Object.isPlainObject(decl);

			let
				validatorName;

			if (isPlainObject) {
				validatorName = Object.keys(decl)[0];

			} else if (isArray) {
				validatorName = decl[0];

			} else {
				validatorName = decl;
			}

			const
				validator = this.validatorsMap[validatorName];

			if (validator == null) {
				throw new Error(`The "${validatorName}" validator is not defined`);
			}

			const validation = validator.call(
				this,
				Object.assign((isPlainObject ? decl[validatorName] : (isArray && decl[1])) ?? {}, opts)
			);

			if (Object.isPromise(validation)) {
				void this.removeMod('valid');
				void this.setMod('progress', true);
			}

			try {
				valid = await validation;

			} catch (err) {
				valid = err;
			}

			if (valid !== true) {
				failedValidation = {
					validator: validatorName,
					message: this.validationMessage,

					error: {
						name: validatorName,
						...Object.isDictionary(valid) ? valid : {}
					}
				};

				break;
			}
		}

		void this.setMod('progress', false);

		if (valid != null) {
			void this.setMod('valid', valid === true);

		} else {
			void this.removeMod('valid');
		}

		if (valid === true) {
			this.emit('validationSuccess');

		} else if (valid != null) {
			this.emit('validationFail', failedValidation);
		}

		this.validationMessage = undefined;
		this.emit('validationEnd', valid === true, failedValidation);

		return valid === true ? valid : failedValidation;
	}

	/**
	 * Resolves the passed component value and returns it.
	 * If the value argument is undefined, the method can return the default value.
	 *
	 * @param [value]
	 */
	protected resolveValue(value?: this['Value']): this['Value'] {
		const
			i = this.instance;

		if (value === undefined && this.lfc.isBeforeCreate()) {
			return i['defaultGetter'].call(this);
		}

		return value;
	}

	/**
	 * Normalizes the passed attributes and returns it
	 * {@link iInput.attrs}
	 *
	 * @param [attrs]
	 */
	protected normalizeAttrs(attrs: Dictionary = {}): Dictionary {
		return attrs;
	}

	/**
	 * Initializes default event listeners for the component value
	 */
	@hook('created')
	protected initValueListeners(): void {
		this.watch('value', this.onValueChange.bind(this));
		this.on('actionChange', () => this.validate());
	}

	protected override initBaseAPI(): void {
		super.initBaseAPI();
		this.resolveValue = this.instance.resolveValue.bind(this);
	}

	protected override initRemoteData(): CanUndef<CanPromise<unknown | Dictionary>> {
		if (this.db == null) {
			return;
		}

		const
			val = this.convertDBToComponent(this.db);

		if (Object.isDictionary(val)) {
			return Promise.all(this.state.set(val)).then(() => val);
		}

		this.value = val;
		return val;
	}

	protected override initModEvents(): void {
		super.initModEvents();

		iAccess.initModEvents(this);
		iVisible.initModEvents(this);

		this.localEmitter.on('block.mod.*.valid.*', ({type, value}: ModEvent) => {
			if (type === 'remove' && value === 'false' || type === 'set' && value === 'true') {
				this.error = undefined;
			}
		});

		this.localEmitter.on('block.mod.*.disabled.*', (e: ModEvent) => this.waitComponentStatus('ready', () => {
			const
				{input} = this.$refs;

			if (input != null) {
				input.disabled = e.value !== 'false' && e.type !== 'remove';
			}
		}));

		this.localEmitter.on('block.mod.*.focused.*', (e: ModEvent) => this.waitComponentStatus('ready', () => {
			const
				{input} = this.$refs;

			if (input == null) {
				return;
			}

			if (e.value !== 'false' && e.type !== 'remove') {
				input.focus();

			} else {
				input.blur();
			}
		}));

		const
			messageInitMap = Object.createDict();

		const createMessageHandler = (type) => (val) => {
			if (messageInitMap[type] == null && this.modsProp != null && String(this.modsProp[type]) === 'false') {
				return false;
			}

			messageInitMap[type] = true;
			return Boolean(val);
		};

		this.sync.mod('showInfo', 'infoStore', createMessageHandler('showInfo'));
		this.sync.mod('showError', 'errorStore', createMessageHandler('showError'));
	}

	/**
	 * Handler: the component in focus
	 */
	protected onFocus(): void {
		void this.setMod('focused', true);
	}

	/**
	 * Handler: the component lost the focus
	 */
	protected onBlur(): void {
		void this.setMod('focused', false);
	}

	/**
	 * Handler: the component value has changed
	 * @emits `change(value: this['Value'])`
	 */
	protected onValueChange(value: this['Value'], oldValue: CanUndef<this['Value']>): void {
		this.prevValue = oldValue;

		if (value !== oldValue || value != null && typeof value === 'object') {
			this.emit('change', this.value);
			this.$emit('update:modelValue', this.value);
		}
	}
}
