'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iData from 'super/i-data/i-data';
import { abstract, field, params, wait } from 'super/i-block/i-block';
import { component } from 'core/component';

const
	$C = require('collection.js');

@component()
export default class iInput extends iData {
	/** @override */
	model: ?Object = {
		prop: 'valueProp',
		event: 'onChange'
	};

	/**
	 * Initial block value
	 */
	valueProp: ?any;

	/**
	 * Block default value
	 */
	defaultProp: ?any;

	/**
	 * Input id
	 */
	id: ?string;

	/**
	 * Input name
	 */
	name: ?string;

	/**
	 * Input autofocus mode
	 */
	autofocus: ?boolean;

	/**
	 * Connected form id
	 */
	form: ?string;

	/**
	 * Illegal block values
	 */
	disallow: ?any | Array | Function | RegExp;

	/**
	 * Block value type factory
	 */
	dataType: Function = Any;

	/**
	 * Form value converter
	 */
	formConverter: ?Function;

	/**
	 * If false, then the block value won't be cached by a form
	 */
	cache: boolean = true;

	/**
	 * List of validators
	 */
	validators: Array = [];

	/**
	 * Block value field name
	 */
	@field()
	blockValueField: string = 'value';

	/**
	 * Block value store
	 */
	@field((o) => o.link('valueProp', (val) => {
		if (val === undefined && o.component.blockValueField === 'value') {
			o.localEvent.once('component.created', () => o.valueStore = o.default);
			return;
		}

		return val;
	}))

	valueStore: any;

	/**
	 * Previous block value
	 */
	@abstract
	prevValue: any;

	/** @inheritDoc */
	static mods = {
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
	 * Block validators
	 */
	static blockValidators = {
		/** @this {iInput} */
		async required({msg, showMsg = true}): boolean {
			if (!await this.formValue) {
				if (showMsg) {
					this.error = msg || t`Required field`;
				}

				return false;
			}

			return true;
		}
	};

	/** @override */
	get error() {
		return this.errorMsg && this.errorMsg.replace(/\.$/, '');
	}

	/**
	 * Link to the form that is associated to the block
	 */
	@params({cache: false})
	get connectedForm(): ?HTMLFormElement {
		return this.waitState('ready', () => this.form ? document.querySelector(`#${this.form}`) : this.$el.closest('form'));
	}

	/**
	 * Block value
	 */
	get value(): any {
		return this.valueStore;
	}

	/**
	 * Sets a new block value
	 * @param value
	 */
	set value(value: any) {
		this.valueStore = value;
	}

	/**
	 * Block default value
	 */
	get default(): any {
		return this.defaultProp;
	}

	/**
	 * Form value of the block
	 */
	@params({cache: false})
	get formValue(): any {
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
	 * Grouped form value of the block
	 */
	@params({cache: false})
	get groupFormValue(): Array | any {
		return (async () => {
			if (this.name) {
				const
					form = this.connectedForm,
					els = [];

				await Promise.all($C(document.getElementsByName(this.name)).reduce((arr, el) => {
					arr.push((async () => {
						el = this.$(el, '[class*="_form_true"]');

						if (el && form === el.connectedForm) {
							els.push(await el.formValue);
						}
					})());

					return arr;
				}, []));

				return els.length > 1 ? els : els[0];
			}

			return await this.formValue;
		})();
	}

	/** @override */
	initRemoteData(): ?any {
		if (!this.db) {
			return;
		}

		return this[this.blockValueField] = this.blockConverter ? this.blockConverter(this.db) : this.db;
	}

	/** @override */
	@wait('ready')
	async focus(): boolean {
		const
			{input} = this.$refs;

		if (document.activeElement !== input) {
			input.focus();
			this.emit('focus');
			return true;
		}

		return false;
	}

	/**
	 * Handler: focus
	 */
	onFocus() {
		this.setMod('focused', true);
	}

	/**
	 * Handler: blur
	 */
	onBlur() {
		this.setMod('focused', false);
	}

	/**
	 * Clears value of the block
	 * @emits clear()
	 */
	@wait('ready')
	async clear(): boolean {
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
	 * Resets the block value to default
	 * @emits reset()
	 */
	@wait('ready')
	async reset(): boolean {
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
	 * Validates the block value
	 *
	 * @param params - additional parameters
	 * @emits validationStart()
	 * @emits validationSuccess()
	 * @emits validationFail()
	 * @emits validationEnd(result: boolean)
	 */
	@wait('ready')
	async validate(params?: Object): boolean {
		if (!this.validators.length) {
			this.removeMod('valid');
			return true;
		}

		this.emit('validationStart');
		let valid;

		for (const el of this.validators) {
			const
				key = Object.isString(el) ? el : Object.keys(el)[0];

			const validator = this.$options.blockValidators[key].call(
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

	/**
	 * Handler: block value change
	 * @emits change(value)
	 */
	onBlockValueChange(newValue: any, oldValue: any) {
		this.prevValue = oldValue;
		if (newValue !== oldValue || newValue && typeof newValue === 'object') {
			this.emit('change', this[this.blockValueField]);
		}
	}

	/** @inheritDoc */
	created() {
		const k = this.blockValueField;
		this.$watch(k + (`${k}Store` in this ? 'Store' : ''), this.onBlockValueChange);
		this.on('actionChange', () => this.validate());
	}
}
