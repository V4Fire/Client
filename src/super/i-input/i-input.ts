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
 * Superclass for form components
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
	 * Component default value
	 */
	@prop({required: false})
	readonly defaultProp?: this['Value'];

	/**
	 * Input DOM identifier
	 */
	@prop({type: String, required: false})
	readonly id?: string;

	/**
	 * Input DOM name
	 */
	@prop({type: String, required: false})
	readonly name?: string;

	/**
	 * Input autofocus mode
	 */
	@prop({type: Boolean, required: false})
	readonly autofocus?: boolean;

	/**
	 * Identifier of a form that connected to the component
	 */
	@prop({type: String, required: false})
	readonly form?: string;

	/**
	 * Component values that are not allowed to send to a form.
	 * The parameter can take a value or list of values to ban,
	 * or a function that checks the values, or a regular expression to test.
	 */
	@prop({required: false})
	readonly disallow?: CanArray<this['Value']> | Function | RegExp;

	/**
	 * Data type of component form value.
	 * This function is used to transform a component value to one of primitive types that will be sent from a form.
	 * For example: String, Blob or Number.
	 */
	@prop(Function)
	readonly dataType: Function = ((Any));

	/**
	 * Converter/s of a component value to a form value.
	 * These functions are used to convert a component value to a value that will be sent from a form.
	 */
	@prop({type: [Function, Array], required: false})
	readonly formConverter?: CanArray<Function>;

	/**
	 * If false, then the component value won't be cached by a form.
	 * The caching is mean, that if the component value doesn't change since the last sending of a form,
	 * it won't be send again.
	 */
	@prop(Boolean)
	readonly cache: boolean = true;

	/**
	 * List of component validators
	 */
	@prop(Array)
	readonly validators: Validators = [];

	/**
	 * Initial information message that component need to show
	 */
	@prop({type: String, required: false})
	readonly infoProp?: string;

	/**
	 * Initial error message that component need to show
	 */
	@prop({type: String, required: false})
	readonly errorProp?: string;

	/**
	 * If true, then will be generated the default markup within a component template to show info/error messages
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
			if (this.form) {
				form = document.querySelector<HTMLFormElement>(`#${this.form}`);

			} else {
				form = this.$el.closest('form');
			}

			return form || undefined;
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

			const match = (el) => {
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
	 * if there are another form components with the same form name,
	 * their values will be grouped
	 */
	@p({replace: false})
	get groupFormValue(): Promise<CanArray<this['FormValue']>> {
		return (async () => {
			const
				list = await this.groupElements;

			const
				els = <this['FormValue'][]>[],
				tasks = <Promise<void>[]>[];

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
	 * List of components from the current form group (components with the same form name)
	 */
	@p({replace: false})
	get groupElements(): CanPromise<ReadonlyArray<iInput>> {
		const
			nm = this.name;

		if (nm) {
			return this.waitStatus('ready', () => {
				const
					form = this.connectedForm,
					list = document.getElementsByName(nm) || [];

				const
					els = <iInput[]>[];

				for (let i = 0; i < list.length; i++) {
					const
						component = this.dom.getComponent<iInput>(list[i], '[class*="_form_true"]');

					if (component && form === component.connectedForm) {
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
			this.waitStatus('ready', () => {
				const
					box = this.block.element('info-box');

				if (box?.children[0]) {
					box.children[0].innerHTML = this.infoStore || '';
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
			this.waitStatus('ready', () => {
				const
					box = this.block.element('error-box');

				if (box?.children[0]) {
					box.children[0].innerHTML = this.errorStore || '';
				}
			});
		}
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
	 * Name of a component property that is used as a source for a form value
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
	async focus(): Promise<boolean> {
		const
			{input} = this.$refs;

		if (input && document.activeElement !== input) {
			input.focus();
			return true;
		}

		return false;
	}

	/** @see [[iAccess.blur]] */
	@p({replace: false})
	@wait('ready')
	async blur(): Promise<boolean> {
		const
			{input} = this.$refs;

		if (input && document.activeElement === input) {
			input.blur();
			return true;
		}

		return false;
	}

	/**
	 * Clears the component value
	 * @emits `clear()`
	 */
	@p({replace: false})
	@wait('ready')
	async clear(): Promise<boolean> {
		if (this[this.valueKey]) {
			this[this.valueKey] = undefined;
			this.async.clearAll({group: 'validation'});
			await this.nextTick();

			this.removeMod('valid');
			this.emit('clear');

			return true;
		}

		return false;
	}

	/**
	 * Resets the component value to default
	 * @emits reset()
	 */
	@p({replace: false})
	@wait('ready')
	async reset(): Promise<boolean> {
		if (this[this.valueKey] !== this.default) {
			this[this.valueKey] = this.default;
			this.async.clearAll({group: 'validation'});
			await this.nextTick();

			this.removeMod('valid');
			this.emit('reset');

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
			return msg(err) || defMsg;
		}

		if (Object.isPlainObject(msg)) {
			return Object.isPlainObject(err) && msg[err.name] || defMsg;
		}

		return msg || defMsg;
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
	 * (returns true or name of the failed validation)
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

		if (!this.validators.length) {
			this.removeMod('valid');
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

			const
				key = <string>(isPlainObject ? Object.keys(decl)[0] : isArray ? decl[0] : decl),
				validator = this.validatorsMap[key];

			if (!validator) {
				throw new Error(`Validator "${key}" is not defined`);
			}

			const validation = validator.call(
				this,
				// tslint:disable-next-line:prefer-object-spread
				Object.assign(isPlainObject ? decl[key] : isArray && decl[1] || {}, params)
			);

			if (Object.isPromise(validation)) {
				this.removeMod('valid');
				this.setMod('progress', true);
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

		this.setMod('progress', false);

		if (valid != null) {
			this.setMod('valid', valid === true);

		} else {
			this.removeMod('valid');
		}

		if (valid === true) {
			this.emit('validationSuccess');

		} else if (valid != null) {
			this.emit('validationFail', failedValidation);
		}

		this.validationMsg = undefined;
		this.emit('validationEnd', valid === true, failedValidation);

		return valid || failedValidation;

		//#endif

		return true;
	}

	/** @override */
	protected initBaseAPI(): void {
		super.initBaseAPI();
		this.resolveValue = this.instance.resolveValue.bind(this);
	}

	/** @override */
	protected initRemoteData(): CanUndef<unknown> {
		if (!this.db) {
			return;
		}

		return this[this.valueKey] = this.convertDBToComponent(this.db);
	}

	/**
	 * Handler: component focus
	 */
	@p({replace: false})
	protected onFocus(): void {
		this.setMod('focused', true);
	}

	/**
	 * Handler: component blur
	 */
	@p({replace: false})
	protected onBlur(): void {
		this.setMod('focused', false);
	}

	/**
	 * Handler: component value change
	 * @emits `change(value)`
	 */
	@p({replace: false})
	protected onValueChange(newValue: this['Value'], oldValue: CanUndef<this['Value']>): void {
		this.prevValue = oldValue;

		if (newValue !== oldValue || newValue && typeof newValue === 'object') {
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
	protected resolveValue(value?: unknown): this['Value'] {
		const
			i = this.instance,
			k = i.valueKey,
			f = this.$activeField;

		if (value !== undefined || f !== k && f !== `${k}Store`) {
			return value;
		}

		// tslint:disable-next-line:no-string-literal
		return i['defaultGetter'].call(this);
	}

	/**
	 * Initializes default event listeners for a component value
	 */
	@p({hook: 'created', replace: false})
	protected initValueListeners(): void {
		this.watch(this.valueKey, this.onValueChange);
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
			msgInit = {};

		const createMsgHandler = (type) => (val) => {
			if (!msgInit[type] && this.modsProp && String(this.modsProp[type]) === 'false') {
				return false;
			}

			msgInit[type] = true;
			return Boolean(val);
		};

		this.sync.mod('showInfo', 'infoStore', createMsgHandler('showInfo'));
		this.sync.mod('showError', 'errorStore', createMsgHandler('showError'));
	}
}
