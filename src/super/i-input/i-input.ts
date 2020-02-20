/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
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

} from 'super/i-input/modules/interface';

export * from 'super/i-data/i-data';
export * from 'super/i-input/modules/interface';

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
	 * Input id
	 */
	@prop({type: String, required: false})
	readonly id?: string;

	/**
	 * Input name
	 */
	@prop({type: String, required: false})
	readonly name?: string;

	/**
	 * Input autofocus mode
	 */
	@prop({type: Boolean, required: false})
	readonly autofocus?: boolean;

	/**
	 * Connected form id
	 */
	@prop({type: String, required: false})
	readonly form?: string;

	/**
	 * Illegal component values
	 */
	@prop({required: false})
	readonly disallow?: CanArray<this['Value']> | Function | RegExp;

	/**
	 * Component value type factory
	 */
	@prop(Function)
	readonly dataType: Function = ((Any));

	/**
	 * Form value converter
	 */
	@prop({type: [Function, Array], required: false})
	readonly formConverter?: CanArray<Function>;

	/**
	 * If false, then the component value won't be cached by a form
	 */
	@prop(Boolean)
	readonly cache: boolean = true;

	/**
	 * List of validators
	 */
	@prop(Array)
	readonly validators: Validators = [];

	/**
	 * Initial information message
	 */
	@prop({type: String, required: false})
	readonly infoProp?: string;

	/**
	 * Initial error message
	 */
	@prop({type: String, required: false})
	readonly errorProp?: string;

	/**
	 * If true, then will be generated a markup for default messages
	 */
	@prop({type: Boolean, required: false})
	readonly messageHelpers?: boolean;

	/**
	 * Previous component value
	 */
	@system({replace: false})
	prevValue?: this['Value'];

	/**
	 * Link to the component validators map
	 */
	@p({replace: false})
	get validatorsMap(): typeof iInput['validators'] {
		return (<typeof iInput>this.instance.constructor).validators;
	}

	/**
	 * Link to the form that is associated to the component
	 */
	@p({cache: false, replace: false})
	get connectedForm(): CanPromise<CanUndef<HTMLFormElement>> {
		return this.waitStatus('ready', () =>
			(this.form ? document.querySelector<HTMLFormElement>(`#${this.form}`) : this.$el.closest('form')) || undefined);
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
	@p({cache: false, replace: false})
	get formValue(): Promise<this['FormValue']> {
		return (async () => {
			await this.nextTick();

			const
				test = (<Array<this['Value'] | Function | RegExp>>[]).concat(this.disallow || []),
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
	 * Grouped form value of the component
	 */
	@p({cache: false, replace: false})
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
	 * List of elements from the current form group
	 */
	@p({cache: false, replace: false})
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
	 * Information message
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

		this.waitStatus('ready', () => {
			const
				box = this.block.element('info-box');

			if (box && box.children[0]) {
				box.children[0].innerHTML = this.infoStore || '';
			}
		});
	}

	/**
	 * Error message
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

		this.waitStatus('ready', () => {
			const
				box = this.block.element('error-box');

			if (box && box.children[0]) {
				box.children[0].innerHTML = this.errorStore || '';
			}
		});
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
	 * Component validators
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
	 * Component value key name
	 */
	@field({replace: false})
	protected readonly valueKey: string = 'value';

	/**
	 * Information message store
	 */
	@system({
		replace: false,
		init: (o) => o.sync.link('infoProp')
	})

	protected infoStore?: string;

	/**
	 * Error message store
	 */
	@system({
		replace: false,
		init: (o) => o.sync.link('errorProp')
	})

	protected errorStore?: string;

	/** @override */
	protected readonly $refs!: {input?: HTMLInputElement};

	/**
	 * Component value store
	 */
	@field<iInput>({
		replace: false,
		init: (o) => o.sync.link((val) => o.initDefaultValue(val))
	})

	protected valueStore!: unknown;

	/**
	 * Internal validation error message
	 */
	@system()
	private validationMsg?: string;

	/** @see iAccess.enable */
	@p({replace: false})
	enable(): Promise<boolean> {
		return iAccess.enable(this);
	}

	/** @see iAccess.disable */
	@p({replace: false})
	disable(): Promise<boolean> {
		return iAccess.disable(this);
	}

	/** @see iAccess.focus */
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

	/** @see iAccess.blur */
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
	 * Clears value of the component
	 * @emits clear()
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
	 * (returns true or a failed validation name)
	 *
	 * @param params - additional parameters
	 * @emits validationStart()
	 * @emits validationSuccess()
	 * @emits validationFail(failedValidation: ValidationError<FV>)
	 * @emits validationEnd(result: boolean, failedValidation?: ValidationError<FV>)
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

		for (const el of this.validators) {
			const
				isArray = Object.isArray(el),
				isPlainObject = !isArray && Object.isPlainObject(el),
				key = <string>(isPlainObject ? Object.keys(el)[0] : isArray ? el[0] : el),
				validator = this.validatorsMap[key];

			if (!validator) {
				throw new Error(`Validator "${key}" is not defined`);
			}

			const validation = validator.call(
				this,
				// tslint:disable-next-line:prefer-object-spread
				Object.assign(isPlainObject ? el[key] : isArray && el[1] || {}, params)
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
		this.initDefaultValue = this.instance.initDefaultValue.bind(this);
	}

	/** @override */
	protected initRemoteData(): CanUndef<unknown> {
		if (!this.db) {
			return;
		}

		return this[this.valueKey] = this.convertDBToComponent(this.db);
	}

	/**
	 * Handler: focus
	 */
	@p({replace: false})
	protected onFocus(): void {
		this.setMod('focused', true);
	}

	/**
	 * Handler: blur
	 */
	@p({replace: false})
	protected onBlur(): void {
		this.setMod('focused', false);
	}

	/**
	 * Handler: component value change
	 * @emits change(value)
	 */
	@p({replace: false})
	protected onValueChange(newValue: this['Value'], oldValue: CanUndef<this['Value']>): void {
		this.prevValue = oldValue;
		if (newValue !== oldValue || newValue && typeof newValue === 'object') {
			this.emit('change', this[this.valueKey]);
		}
	}

	/**
	 * Initializes a default value (if needed) for the valueKey field
	 * @param value - valueKey field value
	 */
	@p({replace: false})
	protected initDefaultValue(value?: unknown): this['Value'] {
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
	 * Initializes events for valueStore
	 */
	@p({hook: 'created', replace: false})
	protected initValueEvents(): void {
		this.watch(this.valueKey, this.onValueChange);
		this.on('actionChange', () => this.validate());
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();

		iAccess.initModEvents(this);
		iVisible.initModEvents(this);

		this.localEvent.on('block.mod.*.valid.*', ({type, value}: ModEvent) => {
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
