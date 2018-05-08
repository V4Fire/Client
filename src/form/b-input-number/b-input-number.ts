/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import bInput, { component, prop } from 'form/b-input/b-input';
export * from 'form/b-input/b-input';

export const
	$$ = symbolGenerator();

@component()
export default class bInputNumber<T extends Dictionary = Dictionary> extends bInput<T> {
	/** @override */
	readonly type: string = 'number';

	/** @override */
	@prop({default(value: string): number | undefined {
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
	get numValue(): number | undefined {
		return this.convertValue(this.valueStore);
	}

	/**
	 * Sets a value to the component
	 * @param [value]
	 */
	setValue(value: string | number | undefined): number | undefined {
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

		this.value = String(v);

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
	protected convertValue(value: any): number | undefined {
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
