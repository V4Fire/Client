/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import $C = require('collection.js');
import bCheckbox from 'form/b-checkbox/b-checkbox';
import iInput, { component, prop, field, p, ValidatorsDecl, ComponentConverter } from 'super/i-input/i-input';
export * from 'super/i-input/i-input';

export type Value = any | any[];
export interface Option extends Dictionary {
	id: string;
	name: string;
	label: string;
	autofocus?: boolean;
}

@component({
	functional: {
		dataProvider: undefined
	}
})

export default class bCheckboxGroup<T extends Dictionary = Dictionary> extends iInput<T> {
	/** @override */
	readonly valueProp: Value = [];

	/** @override */
	@prop({default: (obj) => $C(obj).get('data') || obj || []})
	readonly componentConverter!: ComponentConverter<Option[]>;

	/**
	 * Checkbox selection method
	 */
	@prop(Boolean)
	readonly multiple: boolean = true;

	/**
	 * Initial checkboxes
	 */
	@prop(Array)
	readonly optionsProp: Option[] = [];

	/**
	 * Checkbox component
	 */
	@prop(String)
	readonly option: string = 'b-checkbox';

	/**
	 * Checkboxes store
	 */
	@field<bCheckboxGroup>((o) => o.link((val) => {
		if (o.dataProvider) {
			return o.options || [];
		}

		return val;
	}))

	options!: Option[];

	/**
	 * Array of child checkboxes
	 */
	@p({cache: false})
	get elements(): CanPromise<ReadonlyArray<bCheckbox>> {
		return this.waitStatus('ready', () => {
			const els = $C(this.block.elements('checkbox'))
				.to([])
				.map((el) => this.$(el));

			return Object.freeze(els);
		});
	}

	/** @override */
	get value(): CanUndef<CanArray<string>> {
		const v = this.getField('valueStore');
		return this.multiple ? Object.keys(v) : v;
	}

	/** @override */
	set value(value: CanUndef<CanArray<string>>) {
		this.setField('valueStore', value && Object.isArray(value) ? Object.fromArray(value) : value);
	}

	/** @override */
	static blockValidators: ValidatorsDecl = {
		...iInput.blockValidators,
		async required({msg, showMsg = true}: Dictionary): Promise<boolean> {
			const
				ctx: bCheckboxGroup = <any>this,
				value = await ctx.formValue;

			if (ctx.multiple ? !value.length : value == null) {
				if (showMsg) {
					const
						els = await ctx.elements;

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

	/** @override */
	@field<bCheckboxGroup>((o) => o.link((val) => o.multiple && Object.fromArray(val) || val))
	protected valueStore: CanUndef<Dictionary<boolean> | string>;

	/**
	 * Sets a checkbox value to the group
	 *
	 * @param name - checkbox name
	 * @param value - checkbox value
	 */
	setValue(name: string, value: boolean): CanUndef<boolean> {
		if (!this.multiple) {
			this.setField('valueStore', value ? name : undefined);
			return;
		}

		if (Object.isArray(value)) {
			if (value[1]) {
				this.setField(`valueStore.${value[0]}`, true);

			} else {
				this.deleteField(`valueStore.${value[0]}`);
			}

		} else {
			this.setField(`valueStore.${value}`, true);
		}

		return value;
	}

	/** @override */
	async clear(): Promise<boolean> {
		const
			res = <boolean[]>[];

		for (const el of await this.elements) {
			try {
				res.push(await el.clear());
			} catch {}
		}

		if ($C(res).some((el) => el)) {
			this.emit('clear');
			return true;
		}

		return false;
	}

	/** @override */
	async reset(): Promise<boolean> {
		const
			res = <boolean[]>[];

		for (const el of await this.elements) {
			try {
				res.push(await el.reset());
			} catch {}
		}

		if ($C(res).some((el) => el)) {
			this.emit('reset');
			return true;
		}

		return false;
	}

	/** @override */
	protected initRemoteData(): CanUndef<Option[]> {
		if (!this.db) {
			return;
		}

		const
			val = this.convertDBToComponent<Option[]>(this.db);

		if (Object.isArray(val)) {
			return this.options = val;
		}

		return this.options;
	}

	/**
	 * Returns true if the specified checkbox is checked
	 * @param el
	 */
	protected isChecked(el: Option): boolean {
		const v = this.getField('valueStore');
		return Boolean(this.multiple ? v && v[el.name] : v === el.name);
	}

	/**
	 * Returns true if he specified checkbox can change state
	 * @param el
	 */
	protected isChangeable(el: Option): boolean {
		const v = this.getField('valueStore');
		return this.multiple || v && v !== el.name;
	}

	/**
	 * Handler: value change
	 *
	 * @param el
	 * @param value
	 */
	protected onChange(el: bCheckbox, value: boolean): void {
		if (el.name) {
			this.setValue(el.name, value);
		}
	}

	/**
	 * Handler: action change
	 *
	 * @param el
	 * @param value
	 * @emits actionChange(value: CanUndef<Value>)
	 */
	protected onActionChange(el: bCheckbox, value: boolean): void {
		if (el.name) {
			this.setValue(el.name, value);
			this.emit('actionChange', this.value);
		}
	}
}
