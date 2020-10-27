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

import { identity } from 'core/functools';

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
	ModEvent

} from 'super/i-data/i-data';

import {

	Value,
	FormValue,

	Validators,
	ValidatorMsg,
	ValidatorParams,
	ValidatorResult,
	ValidationResult,
	ValidatorsDecl

} from 'super/i-input/interface';

export * from 'super/i-data/i-data';
export * from 'super/i-input/interface';

/**
 * Superclass for all form components
 */
@component({
	model: {
		prop: 'valueProp',
		event: 'onChange'
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
	 */
	@prop({required: false})
	readonly valueProp?: this['Value'];

	/**
	 * Component default value.
	 * This value will be used if the value prop is not specified or after invoking of `reset`.
	 */
	@prop({required: false})
	readonly defaultProp?: this['Value'];

	/**
	 * Input DOM identifier.
	 * You free to use this prop to connect the component with a label tag or other stuff.
	 */
	@prop({type: String, required: false})
	readonly id?: string;

	/**
	 * DOM identifier of a form that connected to the component
	 */
	@prop({type: String, required: false})
	readonly form?: string;

	/**
	 * Input name for a form: a component value is submitted with it
	 */
	@prop({type: String, required: false})
	readonly name?: string;

	/**
	 * Input autofocus mode
	 */
	@prop({type: Boolean, required: false})
	readonly autofocus?: boolean;

	/**
	 * Input focus order for keyboard navigation
	 */
	@prop({type: Number, required: false})
	readonly tabIndex?: number;

	/**
	 * Component values that are not allowed to send to a form.
	 * The parameter can take a value or list of values to ban.
	 * Also, the parameter can be passed as a function or regular expression.
	 *
	 * @example
	 * ```
	 * /// Disallow values that contain only whitespaces
	 * < b-input :name = 'name' | :disallow = /^\s*$/
	 * ```
	 */
	@prop({required: false})
	readonly disallow?: CanArray<this['Value']> | Function | RegExp;

	/**
	 * Data type of a component form value.
	 * This function is used to transform the component value to one of the primitive types that will be sent from a form.
	 * For example: String, Blob or Number.
	 */
	@prop(Function)
	readonly dataType: Function = identity;

	/**
	 * Converter/s of an original component value to a form value.
	 * These functions are used to convert the component value to a value that will be sent from a form.
	 */
	@prop({type: [Function, Array], required: false})
	readonly formConverter?: CanArray<Function>;

	/**
	 * If false, then the component value isn't cached by a form.
	 * The caching is mean that if the component value doesn't change since the last sending of the form,
	 * it won't be sent again.
	 */
	@prop(Boolean)
	readonly cache: boolean = true;

	/**
	 * List of component validators
	 *
	 * @example
	 * ```
	 * < b-input :name = 'name' | :validators = ['required', ['pattern', {pattern: /^\d+$/}]]
	 * ```
	 */
	@prop(Array)
	readonly validators: Validators = [];

	/**
	 * Initial information message that component need to show.
	 * This parameter logically is pretty similar to STDIN output from Unix.
	 */
	@prop({type: String, required: false})
	readonly infoProp?: string;

	/**
	 * Initial error message that component need to show.
	 * This parameter logically is pretty similar to STDERR output from Unix.
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

	/**
	 * Link to a map of available component validators
	 */
	@p({replace: false})
	get validatorsMap(): typeof iInput['validators'] {
		return (<typeof iInput>this.instance.constructor).validators;
	}

	/**
	 * Link to a form that is tied with the component
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
	 */
	@p({replace: false})
	get default(): unknown {
		return this.defaultProp;
	}

	/**
	 * Form value of the component
	 */
	@p({replace: false})
	get formValue(): Promise<this['FormValue']> {
		return (async () => {
			await this.nextTick();

			const
				test = Array.concat([], this.disallow),
				value = await this[this.valueKey];

			const match = (el): boolean => {
				if (Object.isFunction(el)) {
					return el.call(this, value);
				}

				if (Object.isRegExp(el)) {
					return el.test(value);
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
				return this.dataType(value);
			}

			return undefined;
		})();
	}

	/**
	 * Grouped form value of the component, i.e.
	 * if there are another form components with the same form name, their values will be grouped.
	 * If they are more than one value, the method returns an array of values.
	 */
	@p({replace: false})
	get groupFormValue(): Promise<CanArray<this['FormValue']>> {
		return (async () => {
			const
				list = await this.groupElements;

			const
				els = <Array<this['FormValue']>>[],
				tasks = <Array<Promise<void>>>[];

			for (let i = 0; i < list.length; i++) {
				tasks.push((async () => {
					const
						v = await list[i].formValue;

					if (v !== undefined) {
						els.push(v);
					}
				})());
			}

			await Promise.all(tasks);
			return els.length > 1 ? els : els[0];
		})();
	}

	/**
	 * List of components of the current form group (components with the same form name)
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
	 * Information message that component need to show.
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
	 * Error message that component need to show.
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

	/**
	 * True if the component in focus
	 */
	get isFocused(): boolean {
		const
			{input} = this.$refs;

		if (input != null) {
			return document.activeElement !== input;
		}

		return this.mods.focused === 'true';
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

		async required({msg, showMsg = true}: ValidatorParams): Promise<ValidatorResult<boolean>> {
			if (await this.formValue == null) {
				this.setValidationMsg(this.getValidatorMsg(false, msg, t`Required field`), showMsg);
				return false;
			}

			return true;
		}

		//#endif
	};

	/**
	 * Name of a component property that is used as a component form value.
	 * It's necessary when you inherit a component from another form component,
	 * but your component uses another property as a form value.
	 */
	@field({replace: false})
	protected readonly valueKey: string = 'value';

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
	@wait('ready')
	focus(): Promise<boolean> {
		const
			{input} = this.$refs;

		if (input != null && !this.isFocused) {
			input.focus();
			return Promise.resolve(true);
		}

		return Promise.resolve(false);
	}

	/** @see [[iAccess.blur]] */
	@p({replace: false})
	@wait('ready')
	blur(): Promise<boolean> {
		const
			{input} = this.$refs;

		if (input != null && this.isFocused) {
			input.blur();
			return Promise.resolve(true);
		}

		return Promise.resolve(false);
	}

	/**
	 * Clears the component form value
	 * @emits `clear()`
	 */
	@p({replace: false})
	@wait('ready')
	async clear(): Promise<boolean> {
		if (this[this.valueKey] !== undefined) {
			this[this.valueKey] = undefined;
			this.async.clearAll({group: 'validation'});
			await this.nextTick();

			void this.removeMod('valid');
			this.emit('clear');

			return true;
		}

		return false;
	}

	/**
	 * Resets the component form value to the default
	 * @emits `reset(value: this['Value'])`
	 */
	@p({replace: false})
	@wait('ready')
	async reset(): Promise<boolean> {
		if (this[this.valueKey] !== this.default) {
			this[this.valueKey] = this.default;
			this.async.clearAll({group: 'validation'});
			await this.nextTick();

			void this.removeMod('valid');
			this.emit('reset', this[this.valueKey]);

			return true;
		}

		return false;
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
	 * Sets a validator error message to the component
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
	 * Validates the component value
	 * (returns true or - of the failed validation)
	 *
	 * @param params - additional parameters
	 * @emits `validationStart()`
	 * @emits `validationSuccess()`
	 * @emits `validationFail(failedValidation: ValidationError<this['FormValue']>)`
	 * @emits `validationEnd(result: boolean, failedValidation?: ValidationError<this['FormValue']>)`
	 */
	@p({replace: false})
	@wait('ready')
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
				throw new Error(`Validator "${key}" is not defined`);
			}

			const validation = validator.call(
				this,
				Object.assign(isPlainObject ? decl[key] : (isArray && decl[1]) ?? {}, params)
			);

			if (Object.isPromise(validation)) {
				void this.removeMod('valid');
				void this.setMod('progress', true);
			}

			valid = await validation;

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

		return Object.isTruly(valid) ? valid : failedValidation;

		//#endif

		return true;
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

		this[this.valueKey] = val;
		return val;
	}

	/**
	 * Handler: component focus
	 */
	@p({replace: false})
	protected onFocus(): void {
		void this.setMod('focused', true);
	}

	/**
	 * Handler: component blur
	 */
	@p({replace: false})
	protected onBlur(): void {
		void this.setMod('focused', false);
	}

	/**
	 * Handler: component value change
	 * @emits `change(value)`
	 */
	@p({replace: false})
	protected onValueChange(newValue: this['Value'], oldValue: CanUndef<this['Value']>): void {
		this.prevValue = oldValue;

		if (newValue !== oldValue || newValue != null && typeof newValue === 'object') {
			this.emit('change', this[this.valueKey]);
		}
	}

	/**
	 * Resolves the specified component value and returns it.
	 * If the value argument is undefined, the method returns a value by default.
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
	 * Initializes default event listeners for a component value
	 */
	@p({hook: 'created', replace: false})
	protected initValueListeners(): void {
		this.watch(this.valueKey, this.onValueChange.bind(this));
		this.on('actionChange', () => this.validate());
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
}
