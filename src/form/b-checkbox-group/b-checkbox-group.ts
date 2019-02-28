/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import bCheckbox from 'form/b-checkbox/b-checkbox';
import iInput, {

	component,
	prop,
	field,
	p,
	ValidatorsDecl,
	ValidatorParams,
	ComponentConverter

} from 'super/i-input/i-input';

export * from 'super/i-input/i-input';
export type Value = CanUndef<CanArray<string>>;
export type FormValue = Value;

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

export default class bCheckboxGroup<
	V extends Value = Value,
	FV extends FormValue = FormValue,
	D extends Dictionary = Dictionary
> extends iInput<V, FV, D> {
	/** @override */
	@prop({
		type: Array,
		default: (obj) => obj && obj.data || obj || []
	})

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
	readonly option: string = 'browser-checkbox';

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

	/** @override */
	get value(): V {
		const v = this.field.get('valueStore');
		return <V>(Object.isObject(v) ? Object.keys(v) : v);
	}

	/** @override */
	set value(value: V) {
		this.field.set('valueStore', value && Object.isArray(value) ? Object.fromArray(value) : value);
	}

	/** @override */
	get default(): unknown {
		return (<unknown[]>[]).concat(this.defaultProp !== undefined ? this.defaultProp : []);
	}

	/** @override */
	static blockValidators: ValidatorsDecl = {
		...iInput.blockValidators,
		async required({msg, showMsg = true}: ValidatorParams): Promise<boolean> {
			const
				ctx: bCheckboxGroup = <any>this,
				value = await ctx.formValue;

			if (Object.isArray(value) ? !value.length : value == null) {
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
	setValue(name: string, value: boolean): CanUndef<boolean> {
		if (!this.multiple) {
			this.field.set('valueStore', value ? name : undefined);
			return;
		}

		if (Object.isArray(value)) {
			if (value[1]) {
				this.field.set(`valueStore.${value[0]}`, true);

			} else {
				this.field.delete(`valueStore.${value[0]}`);
			}

		} else {
			this.field.set(`valueStore.${value}`, true);
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
			this.setValue(el.name, value);
			this.emit('actionChange', this.value);
		}
	}
}
