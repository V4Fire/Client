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
	readonly valueProp: any | any[] = [];

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
	@field((o) => o.link('optionsProp', (val) => {
		const
			ctx: bCheckboxGroup = <any>o;

		if (ctx.dataProvider) {
			return ctx.options || [];
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
	get value(): string | string[] | undefined {
		return this.multiple ? Object.keys(<Dictionary>this.valueStore) : <string | undefined>this.valueStore;
	}

	/** @override */
	set value(value: string | string[] | undefined) {
		this.valueStore = value && Object.isArray(value) ? Object.fromArray(value) : value;
	}

	/** @override */
	static blockValidators: ValidatorsDecl = {
		...iInput.blockValidators,
		async required({msg, showMsg = true}: Dictionary): Promise<boolean> {
			const
				ctx: bCheckboxGroup = <any>this,
				value = await ctx.formValue;

			if (ctx.multiple ? !value.length : !value) {
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
	@field((o) => o.link('valueProp', (val) => {
		const ctx: bCheckboxGroup = <any>o;
		return ctx.multiple && Object.fromArray(val) || val;
	}))

	protected valueStore: Dictionary<boolean> | string | undefined;

	/**
	 * Sets a checkbox value to the group
	 *
	 * @param name - checkbox name
	 * @param value - checkbox value
	 */
	setValue(name: string, value: boolean): boolean | undefined {
		if (!this.multiple) {
			this.valueStore = value ? name : undefined;
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
			} catch (_) {}
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
			} catch (_) {}
		}

		if ($C(res).some((el) => el)) {
			this.emit('reset');
			return true;
		}

		return false;
	}

	/** @override */
	protected initRemoteData(): Option[] | undefined {
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
		const v = this.valueStore;
		return Boolean(this.multiple ? v && v[el.name] : v === el.name);
	}

	/**
	 * Returns true if he specified checkbox can change state
	 * @param el
	 */
	protected isChangeable(el: Option): boolean {
		const v = <any>this.valueStore;
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
	 * @emits actionChange(value?: any | any[])
	 */
	protected onActionChange(el: bCheckbox, value: boolean): void {
		if (el.name) {
			this.setValue(el.name, value);
			this.emit('actionChange', this.value);
		}
	}
}
