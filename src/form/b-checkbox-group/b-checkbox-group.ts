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
	system,

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
	 * Parent field name for tree-like component
	 */
	@prop(String)
	readonly parentFrom: string = 'parent';

	/**
	 * Level field name for tree-like component
	 */
	@prop(String)
	readonly levelFrom: string = 'level';

	/**
	 * Checkboxes store
	 */
	@field<bCheckboxGroup>((o) => o.sync.link((val) => {
		if (o.dataProvider) {
			return o.options || [];
		}

		val = o.initDefaultOptions(val);
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
		...iWidth.mods,
		tree: ['true']
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
	 * Key value from the options property
	 */
	@field<bCheckboxGroup>({
		atom: true,
		init: (o) => o.sync.link(
		'optionsProp',
		(val: Option[]) => {
			const
				map = {};

			for (let i = 0; i < val.length; i++) {
				map[<string>val[i].id] = val[i];
				o.initCounters(val[i].parent, map);
			}

			return map;
		})
	})

	protected optionsMap!: Dictionary<Option>;

	/**
	 * Counters for partly checked checkboxes
	 */
	@system()
	protected nestedCounters: Dictionary<[number, number]> = {};

	/**
	 * Sets a checkbox value to the group
	 *
	 * @param name - checkbox name
	 * @param value - checkbox value
	 */
	@wait('ready')
	setValue(name: string, value: boolean): CanPromise<CanUndef<boolean>> {
		if (!this.multiple) {
			const
				oldValue = String(this.value);

			// If not current value checkbox only unchecked -> Do nothing
			if (!value && name !== oldValue) {
				return;
			}

			// Uncheck other values
			if (value && oldValue) {
				for (let o = <ReadonlyArray<bCheckbox>>this.elements, i = 0; i < o.length; i++) {
					if (o[i].name === oldValue) {
						o[i].setMod('checked', false);
						break;
					}
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
	 * Initializes nested checkbox counters
	 *
	 * @param pid - parent identifier
	 * @param map - options key - value
	 */
	protected initCounters(pid: string | undefined, map: Dictionary<Option>): void {
		if (pid && map[pid]) {
			if (!this.nestedCounters[pid]) {
				this.nestedCounters[pid] = [0, 0];
			}

			(<[number, number]>this.nestedCounters[pid])[1]++;

			const
				grandPa = (<Option>map[pid]).parent;

			return grandPa ? this.initCounters(grandPa, map) : undefined;
		}
	}

	/**
	 * Upgrades counters for changed item parents
	 *
	 * @param id
	 * @param value
	 * @param count
	 */
	protected upgradeCounter(id: string, value: boolean, count: number = 1): void {
		const
			item = <Option>this.optionsMap[id],
			parent = item && item.parent;

		if (parent) {
			if (this.nestedCounters[parent]) {
				let
					parentCounter = (<[number, number]>this.nestedCounters[parent])[0];

				parentCounter = value ? parentCounter + count : parentCounter - count;
			}

			return (<Option>this.optionsMap[parent]).parent ? this.upgradeCounter(parent, value, count) : undefined;
		}
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
	 * Initializes options (if needed) for the tree-styled options field
	 * @param [opts]
	 */
	@p({replace: false})
	protected initDefaultOptions(opts?: unknown): Option[] {
		let o;

		if (this.mods.tree && Array.isArray(opts)) {
			o = {};

			const
				l = this.levelFrom,
				p = this.parentFrom,
				obj = <Dictionary<Option>>this.field.get('optionsMap');

			for (let j = 0; j < opts.length; j++) {
				const
					item = opts[j];

				if (!item[p]) {
					o[item.id] = item;

				} else {
					const
						pid = item[p],
						parent = o[pid];

					if (parent) {
						if (parent.children) {
							parent.children.push(item);

						} else {
							Object.assign(parent, {children: [item]});
						}

					} else {
						const
							pp = <Option>obj[pid];

						if (pp[l] === 1) {
							if (!o[pid]) {
								o[pid] = pp;
								o[pid].children = [item];

							} else {
								o[pid].children.push(item);
							}

						} else if (pp.children) {
							(<Option[]>pp.children).push(item);

						} else {
							pp.children = [item];
						}
					}
				}
			}

			return <Option[]>Object.keys(o).map((el) => o[el]);
		}

		return <Option[]>opts;
	}

	/**
	 * Returns an object of props from the specified option
	 * @param option
	 */
	protected getOptionProps(option: Option): Dictionary {
		let
			additional;

		if (this.mods.tree) {
			additional = {
				level: option[this.levelFrom],
				parent: option[this.parentFrom]
			};
		}

		return {
			...option,
			...additional,
			'id': option.id,
			'form': this.form,
			'value': this.isChecked(option),
			'changeable': this.isChangeable(option),
			'class': this.provide.elClasses({checkbox: {}}),
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
		if (!el.silence && el.name) {
			this.setValue(el, value);

			if (el.id) {
				const
					item = this.optionsMap[el.id];

				if (Object.isObject(this.valueStore) && item && item.children) {
					this.visitChild(item, value);
				}

				if (Object.isObject(this.valueStore) && item && item.parent) {
					this.visitParent(<string>item.parent, value);
				}
			}

			this.upgradeCounter(el.id, value);

		} else if (el.silence) {
			el.silence = false;
		}
	}

	protected visitChild(item: Option, value: boolean): void {
		const
			ch = <Option[]>item.children;

		for (let i = 0; i < ch.length; i++) {
			if (ch[i].children) {
				this.visitChild(ch[i], value);
			}

			const
				itemElement = this.$refs[`option-${ch[i].id}`],
				method = `${value ? '' : 'un'}check`;

			itemElement.silence = true;
			itemElement[method]();
		}

		this.upgradeCounter(item.id, value, ch.length);
	}

	/**
	 * Visits parent item by ref and switch its mods
	 *
	 * @param parentId
	 * @param checkedChild
	 */
	protected visitParent(parentId: string, checkedChild: boolean): void {
		const
			pItem = <Option>this.optionsMap[parentId];

		if (Object.isObject(this.valueStore) && pItem) {
			const
				counters = <[number, number]>this.nestedCounters[parentId],
				itemElement = this.$refs[`option-${pItem.id}`];

			itemElement[`${counters[0] === counters[1] ? '' : 'un'}check`]();
			itemElement.setMod('half-checked', counters[0] !== counters[1]);

			if (pItem.parent) {
				this.visitParent(pItem.parent, checkedChild);
			}
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
