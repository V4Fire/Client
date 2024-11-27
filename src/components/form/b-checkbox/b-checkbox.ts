/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/form/b-checkbox/README.md]]
 * @packageDocumentation
 */

import SyncPromise from 'core/promise/sync';

import iSize from 'components/traits/i-size/i-size';

import iInput, {

	component,
	prop,
	system,
	computed,

	ModsDecl,
	ModEvent,

	ValidatorsDecl,
	ValidatorParams,
	ValidatorResult,

	ComponentElement

} from 'components/super/i-input/i-input';

import type { CheckType, Value, FormValue } from 'components/form/b-checkbox/interface';

export * from 'components/super/i-input/i-input';
export * from 'components/form/b-checkbox/interface';

export { Value, FormValue };

@component({
	functional: {
		wait: undefined,
		dataProvider: undefined
	}
})

export default class bCheckbox extends iInput implements iSize {
	/** @inheritDoc */
	declare readonly Value: Value;

	/** @inheritDoc */
	declare readonly FormValue: FormValue;

	/**
	 * If true, the component is checked by default.
	 * Also, it will still be checked after the `reset` method is called.
	 */
	@prop(Boolean)
	override readonly defaultProp: boolean = false;

	/**
	 * The identifier of the "parent" checkbox.
	 * Use this prop to organize the checkbox hierarchy. Checkboxes of the same level must have the same `name`.
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
	 * When you click on a parent checkbox, all child elements will be checked or unchecked.
	 * When you click on a child checkbox, the parent checkbox will be
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
	 * The checkbox label text.
	 * Basically, it's rendered somewhere in the component layout.
	 */
	@prop({type: String, required: false})
	readonly label?: string;

	/**
	 * If true, the checkbox can be unchecked immediately after the first check
	 */
	@prop(Boolean)
	readonly changeable: boolean = true;

	@computed({dependencies: ['mods.checked']})
	override get value(): this['Value'] {
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

	override set value(value: this['Value']) {
		super['valueSetter'](value);
	}

	override get default(): boolean {
		return this.defaultProp;
	}

	/**
	 * True if the checkbox is checked
	 */
	@computed({dependencies: ['mods.checked']})
	get isChecked(): boolean {
		return this.mods.checked === 'true';
	}

	static override readonly mods: ModsDecl = {
		...iSize.mods,

		checked: [
			'true',
			'false',
			'indeterminate'
		]
	};

	static override validators: ValidatorsDecl = {
		...iInput.validators,

		async required({message, showMessage = true}: ValidatorParams): Promise<ValidatorResult<boolean>> {
			const
				value = await this.groupFormValue;

			if (value.length === 0) {
				this.setValidationMessage(this.getValidatorMessage(false, message, this.t`Required field`), showMessage);
				return false;
			}

			return true;
		}
	};

	@system()
	protected override valueStore!: this['Value'];

	/** @inheritDoc */
	declare protected readonly $refs: iInput['$refs'] & {
		input: HTMLInputElement;
	};

	/**
	 * Checks the checkbox
	 * @param value
	 */
	check(value?: CheckType): Promise<boolean> {
		return SyncPromise.resolve(this.setMod('checked', value ?? true));
	}

	/**
	 * Unchecks the checkbox
	 */
	uncheck(): Promise<boolean> {
		return SyncPromise.resolve(this.setMod('checked', false));
	}

	/**
	 * Toggles the checkbox.
	 * The method returns a new value.
	 */
	toggle(): Promise<this['Value']> {
		return (this.mods.checked === 'true' ? this.uncheck() : this.check()).then(() => this.value);
	}

	override clear(): Promise<boolean> {
		const res = super.clear();
		void this.uncheck();
		return res;
	}

	override reset(): Promise<boolean> {
		const onReset = (res: boolean) => {
			if (res) {
				void this.removeMod('valid');
				this.emit('reset', this.value);
				return true;
			}

			return false;
		};

		if (this.default) {
			return this.check().then(onReset);
		}

		return this.uncheck().then(onReset);
	}

	protected override initBaseAPI(): void {
		super.initBaseAPI();

		const i = this.instance;

		this.convertValueToChecked = i.convertValueToChecked.bind(this);
		this.onCheckedChange = i.onCheckedChange.bind(this);
	}

	protected override initModEvents(): void {
		super.initModEvents();
		this.sync.mod('checked', 'value', this.convertValueToChecked.bind(this));
		this.localEmitter.on('block.mod.*.checked.*', this.onCheckedChange.bind(this));
	}

	protected override initValueListeners(): void {
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
	 * Converts the component value to the `checked` modifier value and returns it
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

	protected override resolveValue(value?: this['Value']): this['Value'] {
		const i = this.instance;

		const canApplyDefault =
			value === undefined &&
			this.mods.checked === undefined &&
			this.lfc.isBeforeCreate() &&
			Boolean(i['defaultGetter'].call(this));

		if (canApplyDefault) {
			void this.check();
		}

		return value;
	}

	/**
	 * Handler: the checkbox has been clicked
	 *
	 * @param _e
	 * @emits `actionChange(value: this['Value'])`
	 */
	protected onClick(_e: Event): void {
		void this.focus();

		if (this.value === undefined || this.value === false || this.changeable) {
			void this.toggle();
			this.emit('actionChange', this.value);
		}
	}

	/**
	 * Handler: the checkbox has changed
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
			this.emit('check', Object.parse(e.value));
		}

		if (Object.isTruly(this.id)) {
			const
				els = document.querySelectorAll(`.i-block-helper[data-parent-id="${this.id}"]`);

			for (let i = 0; i < els.length; i++) {
				const
					el = (<ComponentElement>els[i]).component;

				if (this.isComponent(el, bCheckbox)) {
					if (checked) {
						void el.check(<CheckType>e.value);

					} else if (unchecked) {
						void el.uncheck();
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
