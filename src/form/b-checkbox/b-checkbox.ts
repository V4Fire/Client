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
	ValidatorResult

} from 'super/i-input/i-input';

export * from 'super/i-input/i-input';

export type Value = CanUndef<string | boolean>;
export type FormValue = Value;

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

	/**
	 * Checkbox label
	 */
	@prop({type: String, required: false})
	readonly label?: string;

	/**
	 * True if the checkbox can be unchecked directly
	 */
	@prop(Boolean)
	readonly changeable: boolean = true;

	/**
	 * Icon for checkbox
	 */
	@prop({type: String, required: false})
	readonly checkIcon: string = 'check';

	/**
	 * Component for .checkIcon
	 */
	@prop({type: String, required: false})
	readonly checkIconComponent?: string;

	/** @override */
	get default(): unknown {
		return this.defaultProp || false;
	}

	/** @override */
	@p({replace: false})
	get value(): V {
		if (this.mods.checked === 'true') {
			// tslint:disable-next-line:no-string-literal
			const v = super['valueGetter'].call(this);
			return v == null ? true : v;
		}

		return <V>undefined;
	}

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		...iSize.mods,

		checked: [
			'true',
			'false'
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
	async check(): Promise<boolean> {
		return this.setMod('checked', true);
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
	 * @override
	 * @emits check()
	 * @emits uncheck()
	 */
	protected initModEvents(): void {
		super.initModEvents();

		this.sync.mod('checked', 'value', (v) => {
			const
				mod = this.mods.checked;

			if (mod === undefined) {
				return v === true;
			}

			return mod;
		});

		this.localEvent.on('block.mod.*.checked.*', (e: ModEvent) => {
			if (e.type === 'remove' && e.reason !== 'removeMod') {
				return;
			}

			this.$refs.input.checked = (e.type !== 'remove' && e.value === 'true');
			this.emit(this.value ? 'check' : 'uncheck');
		});
	}
}
