/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import iSize from 'traits/i-size/i-size';

import iInput, { component, prop, ModsDecl } from 'super/i-input/i-input';
export * from 'super/i-input/i-input';

export type Value = boolean;
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
	readonly valueProp?: V;

	/** @override */
	@prop({type: Boolean, required: false})
	readonly defaultProp?: V;

	/**
	 * Checkbox label
	 */
	@prop({type: String, required: false})
	readonly label?: string;

	/**
	 * True if the checkbox can be accessed
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

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		...iSize.mods,

		halfChecked: [
			'true',
			'false'
		],

		checked: [
			'true',
			'false'
		]
	};

	/** @override */
	protected readonly $refs!: {input: HTMLInputElement};

	/**
	 * Checks the checkbox
	 */
	async check(): Promise<boolean> {
		if (!this.changeable) {
			return false;
		}

		return this.setMod('checked', true);
	}

	/**
	 * Unchecks the checkbox
	 */
	async uncheck(): Promise<boolean> {
		if (!this.changeable) {
			return false;
		}

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
		await this.toggle();
		this.emit('actionChange', this.mods.checked === 'true');
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		this.sync.mod('checked', 'valueStore');
		this.localEvent.on('block.mod.*.checked.*', (e) => {
			this.value = <V>(e.type !== 'remove' && e.value === 'true');
			this.emit(this.value ? 'check' : 'uncheck');
		});
	}
}
