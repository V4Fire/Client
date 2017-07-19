'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Store from 'core/store';
import bInput from 'form/b-input/b-input';
import { component } from 'core/component';

export const
	$$ = new Store();

@component()
export default class bInputNumber extends bInput {
	/** @override */
	type: string = 'number';

	/** @override */
	dataType: Function = convert;

	/** @override */
	resetButton: boolean = false;

	/**
	 * Position of block controllers
	 */
	controllersPos: string = 'left';

	/**
	 * Value of a step
	 */
	step: number = 1;

	/**
	 * Maximum value
	 */
	max: ?number;

	/**
	 * Minimum value
	 */
	min: ?number;

	/** @override */
	get value(): any {
		return convert(this.valueStore);
	}

	/** @override */
	get default(): string {
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

		super.valueSetter(value);
	}

	/**
	 * Handler: block value increment
	 *
	 * @param factor
	 * @emits actionChange(value: number)
	 */
	onInc(factor: number) {
		this.value = (this.value || 0) + factor * this.step;
		this.emit('actionChange', this.value);
	}
}

/**
 * Block value converter
 */
function convert(value: any): ?number {
	if (!isNaN(value)) {
		return Number(value);
	}
}
