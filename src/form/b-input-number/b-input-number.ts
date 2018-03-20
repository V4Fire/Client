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
	dataType: Function = convert;

	/** @override */
	resetButton: boolean = false;

	/**
	 * Position of block controllers
	 */
	@prop(String)
	controllersPos: string = 'left';

	/**
	 * Value of a step
	 */
	@prop(Number)
	step: number = 1;

	/**
	 * Maximum value
	 */
	@prop({type: Number, required: false})
	max?: number;

	/**
	 * Minimum value
	 */
	@prop({type: Number, required: false})
	min?: number;

	/** @override */
	get value(): number | undefined {
		return convert(this.valueStore);
	}

	/** @override */
	get default(): number | undefined {
		return convert(this.defaultProp);
	}

	/** @override */
	set value(value: any) {
		if (isNaN(value)) {
			return;
		}

		value = Number(value);
		if (this.min != null && value < this.min) {
			value = this.min;

		} else if (this.max != null && value > this.max) {
			value = this.max;
		}

		// tslint:disable-next-line
		super['valueSetter'](value);
	}

	/**
	 * Handler: block value increment
	 *
	 * @param factor
	 * @emits actionChange(value: number)
	 */
	protected onInc(factor: number): void {
		this.value = (this.value || 0) + factor * this.step;
		this.emit('actionChange', this.value);
	}
}

/**
 * Block value converter
 */
function convert(value: any): number | undefined {
	if (!isNaN(value)) {
		return Number(value);
	}
}
