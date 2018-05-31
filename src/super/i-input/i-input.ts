/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import $C = require('collection.js');
import iData, { component, prop, field, system, hook, wait, p, ModsDecl } from 'super/i-data/i-data';

export * from 'super/i-data/i-data';
export type Validators = Array<string | Dictionary<Dictionary>>;
export type ValidatorsDecl<T extends iInput = iInput> =
	Dictionary<(this: T, params: Dictionary) => CanPromise<boolean>>;

@component({
	model: {
		prop: 'valueProp',
		event: 'change'
	}
})

export default class iInput<T extends Dictionary = Dictionary> extends iData<T> {
	/**
	 * Initial component value
	 */
	@prop({required: false})
	readonly valueProp?: any;

	/**
	 * Component default value
	 */
	@prop({required: false})
	readonly defaultProp?: any;

	/**
	 * If true, then the component value will be marked as UTC
	 * (if value is date)
	 */
	@prop(Boolean)
	readonly utc: boolean = false;

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
	readonly disallow?: any | any[] | Function | RegExp;

	/**
	 * Component value type factory
	 */
	@prop(Function)
	readonly dataType: Function = Any;

	/**
	 * Form value converter
	 */
	@prop({type: Function, required: false})
	readonly formConverter?: Function;

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
	 * Previous component value
	 */
	@system()
	prevValue: any;

	/**
	 * Link to the component validators
	 */
	get blockValidators(): typeof iInput['blockValidators'] {
		return (<typeof iInput>this.instance.constructor).blockValidators;
	}

	/** @override */
	get error(): string | undefined {
		return this.errorMsg && this.errorMsg.replace(/\.$/, '');
	}

	/** @override */
	set error(value: string | undefined) {
		this.errorMsg = value;
	}

	/**
	 * Link to the form that is associated to the component
	 */
	@p({cache: false})
	get connectedForm(): CanPromise<HTMLFormElement | null> {
		return this.waitStatus('ready', () => this.form ?
			<any>document.querySelector(`#${this.form}`) : this.$el.closest('form'));
	}

	/**
	 * Component value
	 */
	get value(): any {
		return this.valueStore;
	}

	/**
	 * Sets a new component value
	 * @param value
	 */
	set value(value: any) {
		this.valueStore = value;
	}

	/**
	 * Component default value
	 */
	get default(): any {
		return this.defaultProp;
	}

	/**
	 * Form value of the component
	 */
	@p({cache: false})
	get formValue(): Promise<any> {
		return (async () => {
			await this.nextTick();

			const
				test = [].concat(this.disallow),
				value = await this[this.blockValueField];

			const match = (el) => {
				if (Object.isFunction(el)) {
					return el.call(this, value);
				}

				if (Object.isRegExp(el)) {
					return el.test(value);
				}

				return el === value;
			};

			if (!$C(test).every(match)) {
				return this.dataType(value);
			}

			return undefined;
		})();
	}

	/**
	 * Grouped form value of the component
	 */
	@p({cache: false})
	get groupFormValue(): Promise<any[] | any> {
		return (async () => {
			if (this.name) {
				const
					form = this.connectedForm,
					list = document.getElementsByName(this.name),
					els = <any[]>[];

				const promises = $C(list).to([] as Promise<void>[]).reduce((arr, el) => {
					arr.push((async () => {
						const
							block = this.$<iInput>(el, '[class*="_form_true"]');

						if (block && form === block.connectedForm) {
							els.push(await block.formValue);
						}
					})());

					return arr;
				});

				await Promise.all(promises);
				return els.length > 1 ? els : els[0];
			}

			return this.formValue;
		})();
	}

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		form: [
			['true'],
			'false'
		],

		valid: [
			'true',
			'false'
		]
	};

	/**
	 * Component validators
	 */
	static blockValidators: ValidatorsDecl = {
		async required({msg, showMsg = true}: Dictionary): Promise<boolean> {
			if (!await this.formValue) {
				if (showMsg) {
					this.error = msg || t`Required field`;
				}

				return false;
			}

			return true;
		}
	};

	/**
	 * Component value field name
	 */
	@field()
	protected readonly blockValueField: string = 'value';

	/** @override */
	protected readonly $refs!: {input?: HTMLInputElement};

	/**
	 * Component value store
	 */
	@field((o) => o.link((val) => {
		const ctx: iInput = <any>o;
		return ctx.initDefaultValue(val);
	}))

	protected valueStore: any;

	/** @override */
	@wait('ready')
	async focus(): Promise<boolean> {
		const
			{input} = this.$refs;

		if (input && document.activeElement !== input) {
			input.focus();
			this.emit('focus');
			return true;
		}

		return false;
	}

	/**
	 * Clears value of the component
	 * @emits clear()
	 */
	@wait('ready')
	async clear(): Promise<boolean> {
		if (this[this.blockValueField]) {
			this[this.blockValueField] = undefined;
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
	@wait('ready')
	async reset(): Promise<boolean> {
		if (this[this.blockValueField] !== this.default) {
			this[this.blockValueField] = this.default;
			this.async.clearAll({group: 'validation'});
			await this.nextTick();
			this.removeMod('valid');
			this.emit('reset');
			return true;
		}

		return false;
	}

	/**
	 * Validates the component value
	 *
	 * @param params - additional parameters
	 * @emits validationStart()
	 * @emits validationSuccess()
	 * @emits validationFail()
	 * @emits validationEnd(result: boolean)
	 */
	@wait('ready')
	async validate(params?: Dictionary): Promise<boolean> {
		if (!this.validators.length) {
			this.removeMod('valid');
			return true;
		}

		this.emit('validationStart');
		let valid;

		for (const el of this.validators) {
			const
				key = Object.isString(el) ? el : Object.keys(el)[0];

			const validator = this.blockValidators[key].call(
				this,
				Object.assign(Object.isObject(el) ? el[key] : {}, params)
			);

			if (validator instanceof Promise) {
				this.removeMod('valid');
				this.setMod('progress', true);
			}

			valid = await validator;
			if (!valid) {
				break;
			}
		}

		this.setMod('progress', false);

		if (Object.isBoolean(valid)) {
			this.setMod('valid', valid);

		} else {
			this.removeMod('valid', valid);
		}

		if (valid) {
			this.emit('validationSuccess');

		} else {
			this.emit('validationFail');
		}

		this.emit('validationEnd', valid);
		return valid;
	}

	/** @override */
	protected initBaseAPI(): void {
		super.initBaseAPI();
		this.initDefaultValue = this.instance.initDefaultValue.bind(this);
	}

	/** @override */
	protected initRemoteData(): any | undefined {
		if (!this.db) {
			return;
		}

		return this[this.blockValueField] = this.convertDBToComponent(this.db);
	}

	/**
	 * Handler: focus
	 */
	protected onFocus(): void {
		this.setMod('focused', true);
	}

	/**
	 * Handler: blur
	 */
	protected onBlur(): void {
		this.setMod('focused', false);
	}

	/**
	 * Handler: component value change
	 * @emits change(value)
	 */
	protected onBlockValueChange(newValue: any, oldValue: any): void {
		this.prevValue = oldValue;
		if (newValue !== oldValue || newValue && typeof newValue === 'object') {
			this.emit('change', this[this.blockValueField]);
		}
	}

	/**
	 * Initializes a default value (if needed) for the blockValue field
	 * @param value - blockValue field value
	 */
	protected initDefaultValue(value?: any): any {
		const
			i = this.instance,
			k = i.blockValueField,
			f = this.$activeField;

		if (value !== undefined || f !== k && f !== `${k}Store`) {
			return value;
		}

		// tslint:disable-next-line
		return i['defaultGetter'].call(this);
	}

	/**
	 * Initializes events for valueStore
	 */
	@hook('created')
	protected initValueEvents(): void {
		const k = this.blockValueField;
		this.$watch(k + (`${k}Store` in this ? 'Store' : ''), this.onBlockValueChange);
		this.on('actionChange', () => this.validate());
	}
}
