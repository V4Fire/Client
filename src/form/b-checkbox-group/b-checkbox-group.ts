/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iWidth from 'traits/i-width/i-width';
import bCheckbox from 'form/b-checkbox/b-checkbox';

import iInput, {

	component,
	prop,
	field,
	wait,
	p,

	ValidatorsDecl,
	ValidatorParams,
	ModsDecl

} from 'super/i-input/i-input';

import { Value, FormValue, Option } from 'form/b-checkbox-group/modules/interface';

export * from 'super/i-input/i-input';
export * from 'form/b-checkbox-group/modules/interface';

export { Value, FormValue };

@component({
	functional: {
		dataProvider: undefined
	}
})

export default class bCheckboxGroup<
	V extends Value = Value,
	FV extends FormValue = FormValue,
	D extends object = Dictionary
> extends iInput<V, FV, D> implements iWidth {
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
	@field<bCheckboxGroup>((o) => o.sync.link((val) => {
		if (o.dataProvider) {
			return o.options || [];
		}

		return val;
	}))

	options!: Option[];

	/** @override */
	get value(): V {
		const
			v = this.field.get('valueStore');

		if (Object.isObject(v)) {
			const
				res = <string[]>[];

			for (let keys = Object.keys(v), i = 0; i < keys.length; i++) {
				const
					key = keys[i];

				if (v[key]) {
					res.push(key);
				}
			}

			return <V>res;
		}

		return <V>v;
	}

	/** @override */
	set value(value: V) {
		this.field.set('valueStore', value && Object.isArray(value) ? Object.fromArray(value) : value);
	}

	/**
	 * Array of child checkboxes
	 */
	@p({cache: false})
	get elements(): CanPromise<ReadonlyArray<bCheckbox>> {
		return this.waitStatus('ready', () => {
			const
				els = <bCheckbox[]>[];

			for (let o = this.block.elements('checkbox'), i = 0; i < o.length; i++) {
				els.push(this.dom.getComponent(o[i]));
			}

			return Object.freeze(els);
		});
	}

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		...iWidth.mods
	};

	/** @override */
	static blockValidators: ValidatorsDecl = {
		...iInput.blockValidators,
		async required({msg, showMsg = true}: ValidatorParams): Promise<boolean> {
			const
				ctx: bCheckboxGroup = <any>this,
				value = await ctx.formValue;

			if (Object.isArray(value) ? !value.length : value == null) {
				const
					els = await ctx.elements;

				if (els.length) {
					els[0].setValidationMsg(this.getValidatorMsg(false, msg, t`Required field`), showMsg);
					els[0].setMod('valid', false);
				}

				return false;
			}

			return true;
		}
	};

	/** @override */
	@field<bCheckboxGroup>((o) =>
		o.sync.link((val) => Object.isArray(val) ? o.multiple ? Object.fromArray(val) : val[0] : val)
	)

	protected valueStore: CanUndef<Dictionary<boolean> | string>;

	/**
	 * Sets a checkbox value to the group
	 *
	 * @param name - checkbox name
	 * @param value - checkbox value
	 */
	@wait('ready')
	setValue(name: string, value: boolean): CanPromise<CanUndef<boolean>> {
		if (!this.multiple) {
			// If not current value checkbox only unchecked -> Do nothing
			if (!value && name !== String(this.value)) {
				return;
			}

			// Uncheck other values
			if (value && this.value) {
				for (let o = <ReadonlyArray<bCheckbox>>this.elements, i = 0; i < o.length; i++) {
					o[i].setMod('checked', false);
				}
			}

			this.field.set('valueStore', value ? name : undefined);

		} else {
			this.field.set(`valueStore.${name}`, value);
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

		for (let i = 0; i < res.length; i++) {
			if (res[i]) {
				this.emit('clear');
				return true;
			}
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

		for (let i = 0; i < res.length; i++) {
			if (res[i]) {
				this.emit('reset');
				return true;
			}
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
		const v = this.field.get('valueStore');
		return Boolean(Object.isObject(v) ? v[el.name] : v === el.name);
	}

	/**
	 * Returns true if the specified checkbox can change state
	 * @param el
	 */
	protected isChangeable(el: Option): boolean {
		const v = this.field.get('valueStore');
		return this.multiple || v && v !== el.name;
	}

	/**
	 * Returns an object of props from the specified option
	 * @param option
	 */
	protected getOptionProps(option: Option): Dictionary {
		return {
			...option,
			'id': option.id && this.dom.getId(option.id),
			'form': this.form,
			'value': this.isChecked(option),
			'changeable': this.isChangeable(option),
			'mods': {...option.mods, form: false},
			'@change': this.onChange,
			'@actionChange': this.onActionChange
		};
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
	 * @emits actionChange(value: V)
	 */
	protected onActionChange(el: bCheckbox, value: boolean): void {
		if (el.name) {
			this.emit('actionChange', this.value);
		}
	}
}
