/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import bInput, { component, prop, Value } from 'form/b-input/b-input';

export * from 'form/b-input/b-input';
export type FormValue = number;

export const
	$$ = symbolGenerator();

@component()
export default class bInputNumber<
	V extends Value = Value,
	FV extends FormValue = FormValue,
	D extends Dictionary = Dictionary
// @ts-ignore
> extends bInput<V, FV, D> {
	/** @override */
	readonly type: string = 'number';

	/** @override */
	@prop({default(value: string): CanUndef<number> {
		return this.convertValue(value);
	}})

	readonly dataType!: Function;

	/** @override */
	readonly resetButton: boolean = false;

	/**
	 * Position of component controllers
	 */
	@prop(String)
	readonly controllersPos: string = 'left';

	/**
	 * Value of a step
	 */
	@prop(Number)
	readonly step: number = 1;

	/**
	 * Maximum value
	 */
	@prop({type: Number, required: false})
	readonly max?: number;

	/**
	 * Minimum value
	 */
	@prop({type: Number, required: false})
	readonly min?: number;

	/**
	 * Returns the component value as a number
	 */
	get numValue(): CanUndef<number> {
		return this.convertValue(this.getField('valueStore'));
	}

	/**
	 * Sets a value to the component
	 * @param [value]
	 */
	setValue(value: CanUndef<string | number>): CanUndef<number> {
		let
			v = this.convertValue(value);

		if (v === undefined) {
			return;
		}

		if (this.min != null && v < this.min) {
			v = this.min;

		} else if (this.max != null && v > this.max) {
			v = this.max;
		}

		this.value = <V>String(v);

		const
			{input} = this.$refs;

		if (input) {
			input.value = this.value;
		}

		return v;
	}

	/** @override */
	protected initBaseAPI(): void {
		super.initBaseAPI();
		this.convertValue = this.instance.convertValue.bind(this);
	}

	/**
	 * Converts the specified value to a number and returns it
	 * @param [value]
	 */
	protected convertValue(value: any): CanUndef<number> {
		if (!isNaN(value)) {
			return Number(value);
		}
	}

	/**
	 * Handler: component value increment
	 *
	 * @param factor
	 * @emits actionChange(value: number)
	 */
	protected onInc(factor: number): void {
		this.setValue((this.numValue || 0) + factor * this.step);
		this.emit('actionChange', this.value);
	}
}
