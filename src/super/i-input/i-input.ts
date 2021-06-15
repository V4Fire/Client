/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-input/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';
import SyncPromise from 'core/promise/sync';

import { Option } from 'core/prelude/structures';

import iAccess from 'traits/i-access/i-access';
import iVisible from 'traits/i-visible/i-visible';

import iData, {

	component,

	prop,
	field,
	system,

	wait,
	p,

	ModsDecl,
	ModEvent,
	UnsafeGetter

} from 'super/i-data/i-data';

import type {

	Value,
	FormValue,
	UnsafeIInput,

	Validators,
	ValidatorMsg,
	ValidatorParams,
	ValidatorResult,
	ValidationResult,
	ValidatorsDecl

} from 'super/i-input/interface';

import { unpackIf } from 'super/i-input/modules/helpers';

export * from 'super/i-data/i-data';
export * from 'super/i-input/modules/helpers';
export * from 'super/i-input/interface';

export const
	$$ = symbolGenerator();

/**
 * Superclass for all form components
 */
@component({
	model: {
		prop: 'valueProp',
		event: 'onChange'
	},

	deprecatedProps: {
		dataType: 'formValueConverter'
	}
})

export default abstract class iInput extends iData implements iVisible, iAccess {
	/**
	 * Type: component value
	 */
	readonly Value!: Value;

	/**
	 * Type: component form value
	 */
	readonly FormValue!: FormValue;

	/**
	 * Initial component value
	 * @see [[iInput.value]]
	 */
	@prop({required: false})
	readonly valueProp?: this['Value'];

	/**
	 * An initial component default value.
	 * This value will be used if the value prop is not specified or after invoking of `reset`.
	 *
	 * @see [[iInput.default]]
	 */
	@prop({required: false})
	readonly defaultProp?: this['Value'];

	/**
	 * An input DOM identifier.
	 * You free to use this prop to connect the component with a label tag or other stuff.
	 *
	 * @example
	 * ```
	 * < b-input :id = 'my-input'
	 *   < label for = my-input
	 *     The input label
	 * ```
	 */
	@prop({type: String, required: false})
	readonly id?: string;

	/**
	 * A string specifying a name for the form control.
	 * This name is submitted along with the control's value when the form data is submitted.
	 * If you don't provide the name, your component will be ignored by the form.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname
	 *
	 * @example
	 * ```
	 * < form
	 *   < b-input :name = 'fname' | :value = 'Andrey'

	 *   /// After pressing, the form generates an object to submit with values {fname: 'Andrey'}
	 *   < button type = submit
	 *     Submit
	 * ```
	 */
	@prop({type: String, required: false})
	readonly name?: string;

	/**
	 * A string specifying the `<form>` element with which the component is associated (that is, its form owner).
	 * This string's value, if present, must match the id of a `<form>` element in the same document.
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

	/** @see [[iAccess.autofocus]] */
	@prop({type: Boolean, required: false})
	readonly autofocus?: boolean;

	/** @see [[iAccess.tabIndex]] */
	@prop({type: Number, required: false})
	readonly tabIndex?: number;

	/**
	 * Additional attributes are provided to an "internal" (native) input tag
	 * @see [[iInput.$refs.input]]
	 */
	@prop({type: Object, required: false})
	readonly attrsProp?: Dictionary;

	/**
	 * Component values that are not allowed to send via the tied form.
	 * If a component value matches with one of the denied conditions, the form value will be equal to undefined.
	 *
	 * The parameter can take a value or list of values to ban.
	 * Also, the parameter can be passed as a function or regular expression.
	 *
	 * @see [[iInput.formValue]]
	 * @example
	 * ```
	 * /// Disallow values that contain only whitespaces
	 * < b-input :name = 'name' | :disallow = /^\s*$/
	 * ```
	 */
	@prop({required: false})
	readonly disallow?: CanArray<this['Value']> | Function | RegExp;

	/**
	 * Converter/s of the original component value to a form value.
	 *
	 * You can provide one or more functions to convert the original value to a new form value.
	 * For instance, you have an input component. The input's original value is string, but you provide a function
	 * to parse this string into a data object.
	 *
	 * ```
	 * < b-input :formValueConverter = toDate
	 * ```
	 *
	 * To provide more than one function, use the array form. Functions from the array are invoked from
	 * the "left-to-right".
	 *
	 * ```
	 * < b-input :formValueConverter = [toDate, toUTC]
	 * ```
	 *
	 * Any converter can return a promise. In the case of a list of converters,
	 * they are waiting to resolve the previous invoking.
	 *
	 * Also, any converter can return the `Maybe` monad.
	 * It helps to combine validators and converters.
	 *
	 * ```
	 * < b-input :validators = ['required'] | :formValueConverter = [toDate.option(), toUTC.toUTC()]
	 * ```
	 *
	 * @see [[iInput.formValue]]
	 */
	@prop({type: Function, required: false})
	readonly formValueConverter?: CanArray<Function>;

	/**
	 * Converter/s that is/are used by the associated form.
	 * The form applies these converters to the group form value of the component.
	 *
	 * To provide more than one function, use the array form. Functions from the array are invoked from
	 * the "left-to-right".
	 *
	 * ```
	 * < b-input :formConverter = [toProtobuf, zip]
	 * ```
	 *
	 * Any converter can return a promise. In the case of a list of converters,
	 * they are waiting to resolve the previous invoking.
	 *
	 * Also, any converter can return the `Maybe` monad (all errors transform to undefined).
	 * It helps to combine validators and converters.
	 *
	 * ```
	 * < b-input :validators = ['required'] | :formConverter = [toProtobuf.option(), zip.toUTC()]
	 * ```
	 */
	@prop({type: [Function, Array], required: false})
	readonly formConverter?: CanArray<Function> = unpackIf;

	/**
	 * If false, then a component value isn't cached by the associated form.
	 * The caching is mean that if the component value doesn't change since the last sending of the form,
	 * it won't be sent again.
	 */
	@prop(Boolean)
	readonly cache: boolean = true;

	/**
	 * List of component validators to check
	 *
	 * @example
	 * ```
	 * < b-input :name = 'name' | :validators = ['required', ['pattern', {pattern: /^\d+$/}]]
	 * ```
	 */
	@prop(Array)
	readonly validators: Validators = [];

	/**
	 * An initial information message that the component needs to show.
	 * This parameter logically is pretty similar to STDIN output from Unix.
	 *
	 * @example
	 * ```
	 * < b-input :info = 'This is required parameter'
	 * ```
	 */
	@prop({type: String, required: false})
	readonly infoProp?: string;

	/**
	 * An initial error message that the component needs to show.
	 * This parameter logically is pretty similar to STDERR output from Unix.
	 *
	 * @example
	 * ```
	 * < b-input :error = 'This is required parameter'
	 * ```
	 */
	@prop({type: String, required: false})
	readonly errorProp?: string;

	/**
	 * If true, then is generated the default markup within a component template to show info/error messages
	 */
	@prop({type: Boolean, required: false})
	readonly messageHelpers?: boolean;

	/**
	 * Previous component value
	 */
	@system({replace: false})
	prevValue?: this['Value'];

	/** @override */
	get unsafe(): UnsafeGetter<UnsafeIInput<this>> {
		return <any>this;
	}

	/**
	 * Link to a map of available component validators
	 */
	@p({replace: false})
	get validatorsMap(): typeof iInput['validators'] {
		return (<typeof iInput>this.instance.constructor).validators;
	}

	/**
	 * Link to a form that is associated with the component
	 */
	@p({replace: false})
	get connectedForm(): CanPromise<CanUndef<HTMLFormElement>> {
		return this.waitStatus('ready', () => {
			let
				form;

			// tslint:disable-next-line:prefer-conditional-expression
			if (this.form != null) {
				form = document.querySelector<HTMLFormElement>(`#${this.form}`);

			} else {
				form = this.$el?.closest('form');
			}

			return form ?? undefined;
		});
	}

	/**
	 * Component value
	 * @see [[iInput.valueStore]]
	 */
	@p({replace: false})
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
	 * Component default value
	 * @see [[iInput.defaultProp]]
	 */
	@p({replace: false})
	get default(): this['Value'] {
		return this.defaultProp;
	}

	/**
	 * A component form value.
	 *
	 * By design, all `iInput` components have their "own" values and "form" values.
	 * The form value is based on the own component value, but they are equal in a simple case.
	 * The form associated with this component will use the form value but not the original.
	 *
	 * Parameters from `disallow` test this value. If the value doesn't match allowing parameters,
	 * it will be skipped (the getter returns undefined). The value that passed the validation is converted
	 * via `formValueConverter` (if it's specified).
	 *
	 * The getter always returns a promise.
	 */
	@p({replace: false})
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

			let
				allow = true;

			for (let i = 0; i < test.length; i++) {
				if (match(test[i])) {
					allow = false;
					break;
				}
			}

			if (allow) {
				if (this.formValueConverter != null) {
					const
						converters = Array.concat([], this.formValueConverter);

					let
						res = value;

					for (let i = 0; i < converters.length; i++) {
						const
							validation = converters[i].call(this, res);

						if (validation instanceof Option) {
							res = await validation.catch(() => undefined);

						} else {
							res = await validation;
						}
					}

					return res;
				}

				return value;
			}

			return undefined;
		})();
	}

	/**
	 * A list of form values. The values are taken from components with the same `name` prop and
	 * which are associated with the same form.
	 *
	 * The getter always returns a promise.
	 *
	 * @see [[iInput.formValue]]
	 */
	@p({replace: false})
	get groupFormValue(): Promise<Array<this['FormValue']>> {
		return (async () => {
			const
				list = await this.groupElements;

			const
				values = <Array<this['FormValue']>>[],
				tasks = <Array<Promise<void>>>[];

			for (let i = 0; i < list.length; i++) {
				tasks.push((async () => {
					const
						v = await list[i].formValue;

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
	@p({replace: false})
	get groupElements(): CanPromise<readonly iInput[]> {
		const
			nm = this.name;

		if (nm != null) {
			return this.waitStatus('ready', () => {
				const
					form = this.connectedForm,
					list = document.getElementsByName(nm);

				const
					els = <iInput[]>[];

				for (let i = 0; i < list.length; i++) {
					const
						component = this.dom.getComponent<iInput>(list[i], '[class*="_form_true"]');

					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					if (component != null && form === component.connectedForm) {
						els.push(component);
					}
				}

				return Object.freeze(els);
			});
		}

		return Object.freeze([this]);
	}

	/**
	 * An information message that the component needs to show.
	 * This parameter logically is pretty similar to STD output from Unix.
	 */
	@p({replace: false})
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
			void this.waitStatus('ready', () => {
				const
					box = this.block?.element('info-box');

				if (box?.children[0]) {
					box.children[0].innerHTML = this.infoStore ?? '';
				}
			});
		}
	}

	/**
	 * An error message that the component needs to show.
	 * This parameter logically is pretty similar to STDERR output from Unix.
	 */
	@p({replace: false})
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
			void this.waitStatus('ready', () => {
				const
					box = this.block?.element('error-box');

				if (box?.children[0]) {
					box.children[0].innerHTML = this.errorStore ?? '';
				}
			});
		}
	}

	/** @see [[iAccess.isFocused]] */
	get isFocused(): boolean {
		const
			{input} = this.$refs;

		if (input != null) {
			return document.activeElement === input;
		}

		return iAccess.isFocused(this);
	}

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
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
	 * Map of available component validators
	 */
	static validators: ValidatorsDecl = {
		//#if runtime has iInput/validators

		/**
		 * Checks that a component value must be filled
		 *
		 * @param msg
		 * @param showMsg
		 */
		async required({msg, showMsg = true}: ValidatorParams): Promise<ValidatorResult<boolean>> {
			if (await this.formValue === undefined) {
				this.setValidationMsg(this.getValidatorMsg(false, msg, t`Required field`), showMsg);
				return false;
			}

			return true;
		}

		//#endif
	};

	/**
	 * Additional attributes that are provided to an "internal" (native) input tag
	 * @see [[iInput.attrsProp]]
	 */
	@system((o) => o.sync.link())
	protected attrs?: Dictionary;

	/** @see [[iInput.info]] */
	@system({
		replace: false,
		init: (o) => o.sync.link()
	})

	protected infoStore?: string;

	/** @see [[iInput.error]] */
	@system({
		replace: false,
		init: (o) => o.sync.link()
	})

	protected errorStore?: string;

	/** @override */
	protected readonly $refs!: {input?: HTMLInputElement};

	/** @see [[iInput.value]] */
	@field<iInput>({
		replace: false,
		init: (o) => o.sync.link((val) => o.resolveValue(val))
	})

	protected valueStore!: unknown;

	/**
	 * Internal validation error message
	 */
	@system()
	private validationMsg?: string;

	/** @see [[iAccess.enable]] */
	@p({replace: false})
	enable(): Promise<boolean> {
		return iAccess.enable(this);
	}

	/** @see [[iAccess.disable]] */
	@p({replace: false})
	disable(): Promise<boolean> {
		return iAccess.disable(this);
	}

	/** @see [[iAccess.focus]] */
	@p({replace: false})
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

	/** @see [[iAccess.blur]] */
	@p({replace: false})
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
	@p({replace: false})
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
	 * Resets the component value to default
	 * @emits `reset(value: this['Value'])`
	 */
	@p({replace: false})
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
	 * Returns a validator error message from the specified arguments
	 *
	 * @param err - error details
	 * @param msg - error message / error table / error function
	 * @param defMsg - default error message
	 */
	getValidatorMsg(err: ValidatorResult, msg: ValidatorMsg, defMsg: string): string {
		if (Object.isFunction(msg)) {
			const m = msg(err);
			return Object.isTruly(m) ? m : defMsg;
		}

		if (Object.isPlainObject(msg)) {
			return Object.isPlainObject(err) && msg[err.name] || defMsg;
		}

		return Object.isTruly(msg) ? String(msg) : defMsg;
	}

	/**
	 * Sets a validation error message to the component
	 *
	 * @param msg
	 * @param [showMsg] - if true, then the message will be provided to .error
	 */
	setValidationMsg(msg: string, showMsg: boolean = false): void {
		this.validationMsg = msg;

		if (showMsg) {
			this.error = msg;
		}
	}

	/**
	 * Validates a component value
	 * (returns true or `ValidationError` if the validation is failed)
	 *
	 * @param params - additional parameters
	 * @emits `validationStart()`
	 * @emits `validationSuccess()`
	 * @emits `validationFail(failedValidation: ValidationError<this['FormValue']>)`
	 * @emits `validationEnd(result: boolean, failedValidation?: ValidationError<this['FormValue']>)`
	 */
	@p({replace: false})
	@wait('ready', {defer: true, label: $$.validate})
	async validate(params?: ValidatorParams): Promise<ValidationResult<this['FormValue']>> {
		//#if runtime has iInput/validators

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
				key;

			if (isPlainObject) {
				key = Object.keys(decl)[0];

			} else if (isArray) {
				key = decl[0];

			} else {
				key = decl;
			}

			const
				validator = this.validatorsMap[key];

			if (validator == null) {
				throw new Error(`The "${key}" validator is not defined`);
			}

			const validation = validator.call(
				this,
				Object.assign(isPlainObject ? decl[key] : (isArray && decl[1]) ?? {}, params)
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
					validator: key,
					error: valid,
					msg: this.validationMsg
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

		this.validationMsg = undefined;
		this.emit('validationEnd', valid === true, failedValidation);

		return valid === true ? valid : failedValidation;

		//#endif

		return true;
	}

	/**
	 * Resolves the specified component value and returns it.
	 * If the value argument is `undefined`, the method can returns the default value.
	 *
	 * @param value
	 */
	@p({replace: false})
	protected resolveValue(value?: this['Value']): this['Value'] {
		const
			i = this.instance;

		if (value === undefined && this.lfc.isBeforeCreate()) {
			return i['defaultGetter'].call(this);
		}

		return value;
	}

	/**
	 * Normalizes the specified additional attributes and returns it
	 *
	 * @see [[iInput.attrs]]
	 * @param [attrs]
	 */
	protected normalizeAttrs(attrs: Dictionary = {}): Dictionary {
		return attrs;
	}

	/**
	 * Initializes default event listeners of the component value
	 */
	@p({hook: 'created', replace: false})
	protected initValueListeners(): void {
		this.watch('value', this.onValueChange.bind(this));
		this.on('actionChange', () => this.validate());
	}

	/** @override */
	protected initBaseAPI(): void {
		super.initBaseAPI();
		this.resolveValue = this.instance.resolveValue.bind(this);
	}

	/** @override */
	protected initRemoteData(): CanUndef<CanPromise<unknown | Dictionary>> {
		if (!this.db) {
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

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();

		iAccess.initModEvents(this);
		iVisible.initModEvents(this);

		this.localEmitter.on('block.mod.*.valid.*', ({type, value}: ModEvent) => {
			if (type === 'remove' && value === 'false' || type === 'set' && value === 'true') {
				this.error = undefined;
			}
		});

		const
			msgInit = Object.createDict();

		const createMsgHandler = (type) => (val) => {
			if (msgInit[type] == null && this.modsProp != null && String(this.modsProp[type]) === 'false') {
				return false;
			}

			msgInit[type] = true;
			return Boolean(val);
		};

		this.sync.mod('showInfo', 'infoStore', createMsgHandler('showInfo'));
		this.sync.mod('showError', 'errorStore', createMsgHandler('showError'));
	}

	/**
	 * Handler: the component in focus
	 */
	@p({replace: false})
	protected onFocus(): void {
		void this.setMod('focused', true);
	}

	/**
	 * Handler: the component lost the focus
	 */
	@p({replace: false})
	protected onBlur(): void {
		void this.setMod('focused', false);
	}

	/**
	 * Handler: changing of a component value
	 * @emits `change(value: this['Value'])`
	 */
	@p({replace: false})
	protected onValueChange(value: this['Value'], oldValue: CanUndef<this['Value']>): void {
		this.prevValue = oldValue;

		if (value !== oldValue || value != null && typeof value === 'object') {
			this.emit('change', this.value);
		}
	}
}
