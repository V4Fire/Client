/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:form/b-checkbox/README.md]]
 * @packageDocumentation
 */

//#if demo
import 'models/demo/checkbox';
//#endif

import symbolGenerator from 'core/symbol';
import SyncPromise from 'core/promise/sync';

import iSize from 'traits/i-size/i-size';

import iInput, {

	component,
	prop,
	computed,
	p,

	ModsDecl,
	ModEvent,

	ValidatorsDecl,
	ValidatorParams,
	ValidatorResult,

	ComponentElement

} from 'super/i-input/i-input';

import type { CheckType, Value, FormValue } from 'form/b-checkbox/interface';

export * from 'super/i-input/i-input';
export * from 'form/b-checkbox/interface';

export { Value, FormValue };

export const
	$$ = symbolGenerator();

/**
 * Component to create a checkbox
 */
@component({
	flyweight: true,
	functional: {
		dataProvider: undefined
	}
})

export default class bCheckbox extends iInput implements iSize {
	/** @override */
	readonly Value!: Value;

	/** @override */
	readonly FormValue!: FormValue;

	/** @override */
	@prop({type: Boolean, required: false})
	readonly defaultProp?: this['Value'];

	/**
	 * An identifier of the "parent" checkbox.
	 * Use this prop to organize a hierarchy of checkboxes. Checkboxes of the same level must have the same `name`.
	 *
	 * ```
	 * - [-]
	 *   - [X]
	 *   - [ ]
	 *   - [X]
	 *     - [X]
	 *     - [X]
	 * ```
	 *
	 * When you click a parent checkbox, all children will be checked or unchecked.
	 * When you click a child, the parent checkbox will be
	 *   * checked as `'indeterminate'` - if not all checkboxes with the same `name` are checked;
	 *   * unchecked - if all checkboxes with the same `name` are checked.
	 *
	 * @example
	 * ```
	 * < b-checkbox :id = 'parent'
	 *
	 * < b-checkbox &
	 *   :id = 'foo' |
	 *   :name = 'lvl2' |
	 *   :parentId = 'parent'
	 * .
	 *
	 * < b-checkbox &
	 *   :id = 'foo2' |
	 *   :parentId = 'parent' |
	 *   :name = 'lvl2'
	 * .
	 *
	 * < b-checkbox &
	 *   :parentId = 'foo' |
	 *   :name = 'lvl3-foo'
	 * .
	 *
	 * < b-checkbox &
	 *   :parentId = 'foo2' |
	 *   :name = 'lvl3-foo2'
	 * .
	 * ```
	 */
	@prop({type: String, required: false})
	readonly parentId?: string;

	/**
	 * A checkbox' label text. Basically, it outputs somewhere in the component layout.
	 */
	@prop({type: String, required: false})
	readonly label?: string;

	/**
	 * True if the checkbox can be unchecked directly after the first check
	 */
	@prop(Boolean)
	readonly changeable: boolean = true;

	/** @override */
	get default(): unknown {
		return this.defaultProp ?? false;
	}

	/** @override */
	@p({replace: false})
	get value(): this['Value'] {
		const
			{checked} = this.mods;

		if (checked === 'true' || checked === undefined) {
			const
				v = super['valueGetter'].call(this);

			if (checked === undefined) {
				return v === true || undefined;
			}

			return v == null ? true : v;
		}

		return undefined;
	}

	/** @override */
	set value(value: this['Value']) {
		super['valueSetter'](value);
	}

	/**
	 * True if the checkbox is checked
	 */
	@computed({dependencies: ['mods.checked']})
	get isChecked(): boolean {
		return this.mods.checked === 'true';
	}

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		...iSize.mods,

		checked: [
			'true',
			'false',
			'indeterminate'
		]
	};

	/** @override */
	static validators: ValidatorsDecl = {
		//#if runtime has iInput/validators

		async required({msg, showMsg = true}: ValidatorParams): Promise<ValidatorResult<boolean>> {
			const
				value = await this.formValue;

			if (value === undefined || value === false) {
				this.setValidationMsg(this.getValidatorMsg(false, msg, t`Required field`), showMsg);
				return false;
			}

			return true;
		}

		//#endif
	};

	/** @override */
	protected readonly $refs!: {input: HTMLInputElement};

	/**
	 * Checks the checkbox
	 */
	async check(value?: CheckType): Promise<boolean> {
		return this.setMod('checked', value ?? true);
	}

	/**
	 * Unchecks the checkbox
	 */
	async uncheck(): Promise<boolean> {
		return this.setMod('checked', false);
	}

	/**
	 * Toggles the checkbox.
	 * The method returns a new value.
	 */
	async toggle(): Promise<this['Value']> {
		await (this.mods.checked === 'true' ? this.uncheck() : this.check());
		return this.value;
	}

	/** @override */
	async clear(): Promise<boolean> {
		const cleared = await super.clear();
		return cleared ? this.uncheck() : false;
	}

	/** @override */
	async reset(): Promise<boolean> {
		const cleared = await super.reset();
		return cleared ? this[`${Object.isTruly(this.default) ? '' : 'un'}check`]() : false;
	}

	/** @override */
	protected initBaseAPI(): void {
		super.initBaseAPI();
		this.convertValueToChecked = this.instance.convertValueToChecked.bind(this);
		this.onCheckedChange = this.instance.onCheckedChange.bind(this);
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		this.sync.mod('checked', 'value', this.convertValueToChecked.bind(this));
		this.localEmitter.on('block.mod.*.checked.*', this.onCheckedChange.bind(this));
	}

	/** @override */
	protected initValueListeners(): void {
		this.on('actionChange', () => this.validate());

		let
			oldVal = this.value;

		this.localEmitter.on('block.mod.*.checked.*', (e: ModEvent) => {
			if (e.type === 'remove' && e.reason !== 'removeMod') {
				return;
			}

			this.onValueChange(e.value === 'false' || e.type === 'remove' ? undefined : this.value, oldVal);
			oldVal = this.value;
		});
	}

	/**
	 * Returns a modifier value by the component value
	 * @param value
	 */
	protected convertValueToChecked(value: Value): boolean | string {
		const
			{checked} = this.mods;

		if (checked === undefined) {
			return value === true;
		}

		return checked;
	}

	/** @override */
	@p({replace: false})
	protected resolveValue(value?: this['Value']): this['Value'] {
		const
			i = this.instance;

		if (value === undefined && this.mods.checked === undefined && this.lfc.isBeforeCreate()) {
			const
				v = i['defaultGetter'].call(this);

			if (Object.isTruly(v)) {
				void this.setMod('checked', true);
				return v;
			}
		}

		return value;
	}

	/**
	 * Handler: checkbox trigger
	 *
	 * @param e
	 * @emits `actionChange(value: this['Value'])`
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
	protected async onClick(e: Event): Promise<void> {
		await this.focus();

		if ((!Object.isTruly(this.value) || this.changeable)) {
			await this.toggle();
			this.emit('actionChange', this.mods.checked === 'true');
		}
	}

	/**
	 * Handler: checkbox change
	 *
	 * @param e
	 * @emits `check(type:` [[CheckType]]`)`
	 * @emits `uncheck()`
	 */
	protected onCheckedChange(e: ModEvent): void {
		if (e.type === 'remove' && e.reason !== 'removeMod') {
			return;
		}

		const
			{input} = this.$refs;

		const
			setMod = e.type !== 'remove',
			checked = setMod && e.value === 'true',
			unchecked = !setMod || e.value === 'false';

		input.checked = checked;
		input.indeterminate = setMod && e.value === 'indeterminate';

		if (unchecked) {
			this.emit('uncheck');

		} else {
			this.emit('check', e.value);
		}

		if (Object.isTruly(this.id)) {
			const
				els = document.querySelectorAll(`.i-block-helper[data-parent-id="${this.id}"]`);

			for (let i = 0; i < els.length; i++) {
				const
					el = (<ComponentElement>els[i]).component;

				if (this.isComponent(el, bCheckbox)) {
					if (checked) {
						el.check(<CheckType>e.value).catch(stderr);

					} else if (unchecked) {
						el.uncheck().catch(stderr);
					}
				}
			}
		}

		if (Object.isTruly(this.parentId)) {
			const parent = (<CanUndef<ComponentElement>>document.getElementById(this.parentId!)
				?.closest('.i-block-helper'))
				?.component;

			if (this.isComponent(parent, bCheckbox)) {
				SyncPromise.resolve(this.groupElements).then((els) => {
					if (els.every((el) => el.mods.checked == null || el.mods.checked === 'false')) {
						return parent.uncheck();
					}

					return parent.check(els.every((el) => el.mods.checked === 'true') || 'indeterminate');
				}).catch(stderr);
			}
		}
	}
}
