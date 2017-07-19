'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iInput from 'super/i-input/i-input';
import { field, params, mixin } from 'super/i-block/i-block';
import { component } from 'core/component';

const
	$C = require('collection.js');

@component()
export default class bCheckboxGroup extends iInput {
	/** @override */
	valueProp: ?any | Array = [];

	/** @override */
	@params({default: (obj) => $C(obj).get('data') || obj || []})
	blockConverter: ?Function;

	/**
	 * Checkbox selection method
	 */
	multiple: boolean = true;

	/**
	 * Initial checkboxes
	 */
	optionsProp: Array<Object> = [];

	/**
	 * Checkbox component
	 */
	option: string = 'b-checkbox';

	/** @override */
	@field((o) => o.link('valueProp', (val) => o.multiple && Object.fromArray(val) || val))
	valueStore: any;

	/**
	 * Checkboxes store
	 */
	@field((o) => o.link('optionsProp', (val) => {
		if (o.dataProvider || Object.fastCompare(val, o.optionsStore)) {
			return o.options || [];
		}

		return val;
	}))

	options: Array<Object>;

	/** @override */
	get $refs(): {input: HTMLInputElement} {}

	/** @override */
	@mixin
	static blockValidators = {
		/** @this {iInput} */
		async required({msg, showMsg = true}): boolean {
			const value = await this.formValue;
			if (this.multiple ? !value.length : !value) {
				if (showMsg) {
					const
						els = await this.elements;

					if (els.length) {
						els[0].error = msg || t`Required field`;
						els[0].setMod('valid', false);
					}
				}

				return false;
			}

			return true;
		}
	};

	/**
	 * Array of child checkboxes
	 */
	@params({cache: false})
	get elements(): Array<bCheckbox> {
		return this.waitState('ready', () => $C(this.block.elements('checkbox')).map((el) => this.$(el)));
	}

	/** @override */
	get value(): any {
		return this.multiple ? Object.keys(this.valueStore) : this.valueStore;
	}

	/** @override */
	set value(value: any) {
		if (!this.multiple) {
			return value[1] && this.$set(this, 'valueStore', value[0]);
		}

		if (Object.isArray(value)) {
			if (value[1]) {
				this.$set(this.valueStore, value[0], true);

			} else {
				this.$delete(this.valueStore, value[0]);
			}

		} else {
			this.$set(this.valueStore, value, true);
		}
	}

	/** @override */
	initRemoteData(): ?any {
		if (!this.db) {
			return;
		}

		const
			val = this.blockConverter ? this.blockConverter(this.db) : this.db;

		if (Object.isArray(val)) {
			return this.options = val;
		}

		return this.options;
	}

	/** @override */
	async clear(): boolean {
		const res = [];
		for (const el of await this.elements) {
			try {
				res.push(await el.clear());
			} catch (_) {}
		}

		if ($C(res).some((el) => el)) {
			this.emit('clear');
			return true;
		}

		return false;
	}

	/** @override */
	async reset(): boolean {
		const res = [];
		for (const el of await this.elements) {
			try {
				res.push(await el.reset());
			} catch (_) {}
		}

		if ($C(res).some((el) => el)) {
			this.emit('reset');
			return true;
		}

		return false;
	}

	/**
	 * Returns true if the specified checkbox is checked
	 * @param el
	 */
	isChecked(el: Object): boolean {
		return this.multiple ? this.valueStore[el.name] : this.valueStore === el.name;
	}

	/**
	 * Returns true if he specified checkbox can change state
	 * @param el
	 */
	isChangeable(el: Object): boolean {
		return this.multiple || this.value && this.value !== el.name;
	}

	/**
	 * Handler: value change
	 *
	 * @param el
	 * @param value
	 */
	onChange(el: bCheckbox, value: boolean) {
		if (el.name) {
			this.value = [el.name, value];
		}
	}

	/**
	 * Handler: action change
	 *
	 * @param el
	 * @param value
	 * @emits actionChange(value: ?any | Array)
	 */
	onActionChange(el: bCheckbox, value: boolean) {
		if (el.name) {
			this.value = [el.name, value];
			this.emit('actionChange', this.value);
		}
	}
}
