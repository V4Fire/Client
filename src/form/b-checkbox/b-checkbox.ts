/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import iSize from 'traits/i-size/i-size';

import iInput, {

	component,
	prop,
	p,

	ModsDecl,
	ModEvent,

	ValidatorsDecl,
	ValidatorParams,
	ValidatorResult,

	ComponentElement

} from 'super/i-input/i-input';

export * from 'super/i-input/i-input';

export type Value = CanUndef<string | boolean>;
export type FormValue = Value;
export type CheckType = true | 'indeterminate';

export const
	$$ = symbolGenerator();

@component({
	flyweight: true,
	functional: {
		dataProvider: undefined
	}
})

export default class bCheckbox<
	V extends Value = Value,
	FV extends FormValue = FormValue,
	D extends object = Dictionary
> extends iInput<V, FV, D> implements iSize {
	/** @override */
	@prop({type: Boolean, required: false})
	readonly defaultProp?: V;

	/** @override */
	@prop({type: String, required: false})
	readonly parentId?: string;

	/**
	 * Checkbox label text
	 */
	@prop({type: String, required: false})
	readonly label?: string;

	/**
	 * True if the checkbox can be unchecked directly
	 */
	@prop(Boolean)
	readonly changeable: boolean = true;

	/** @override */
	get default(): unknown {
		return this.defaultProp || false;
	}

	/** @override */
	@p({replace: false})
	get value(): V {
		const
			{checked} = this.mods;

		if (checked === 'true' || checked === undefined) {
			const
				// tslint:disable-next-line:no-string-literal
				v = super['valueGetter'].call(this);

			if (checked === undefined) {
				return <V>(v === true || undefined);
			}

			return v == null ? true : v;
		}

		return <V>undefined;
	}

	/** @override */
	set value(value: V) {
		// tslint:disable-next-line:no-string-literal
		super['valueSetter'](value);
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
			if (!await this.formValue) {
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
		return this.setMod('checked', value || true);
	}

	/**
	 * Unchecks the checkbox
	 */
	async uncheck(): Promise<boolean> {
		return this.setMod('checked', false);
	}

	/**
	 * Toggles the checkbox
	 */
	toggle(): Promise<boolean> {
		return this.mods.checked === 'true' ? this.uncheck() : this.check();
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
		this.sync.mod('checked', 'value', this.convertValueToChecked);
		this.localEvent.on('block.mod.*.checked.*', this.onCheckedChange);
	}

	/** @override */
	protected initValueEvents(): void {
		this.on('actionChange', () => this.validate());

		let
			oldVal = this.value;

		this.localEvent.on('block.mod.*.checked.*', (e: ModEvent) => {
			if (e.type === 'remove' && e.reason !== 'removeMod') {
				return;
			}

			this.onValueChange(<V>(e.value === 'false' || e.type === 'remove' ? undefined : this.value), oldVal);
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

	/**
	 * Handler: checkbox trigger
	 *
	 * @param e
	 * @emits actionChange(value: V)
	 */
	protected async onClick(e: Event): Promise<void> {
		await this.focus();

		if ((!this.value || this.changeable) && await this.toggle()) {
			this.emit('actionChange', this.mods.checked === 'true');
		}
	}

	/**
	 * Handler: checkbox change
	 *
	 * @param e
	 * @emits check(type: CheckType)
	 * @emits uncheck()
	 */
	protected async onCheckedChange(e: ModEvent): Promise<void> {
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

		if (this.id) {
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

		if (this.parentId) {
			const parent = (<ComponentElement>document.getElementById(this.parentId)
				?.closest('.i-block-helper'))
				?.component;

			if (this.isComponent(parent, bCheckbox)) {
				const
					els = await this.groupElements;

				if (els.every((el) => !el.mods.checked || el.mods.checked === 'false')) {
					parent.uncheck().catch(stderr);

				} else {
					parent.check(els.every((el) => el.mods.checked === 'true') || 'indeterminate').catch(stderr);
				}
			}
		}
	}
}
