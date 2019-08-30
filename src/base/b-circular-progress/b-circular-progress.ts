/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iVisible from 'traits/i-visible/i-visible';

import iBlock, { component, prop, ModsDecl, system } from 'super/i-block/i-block';

export * from 'super/i-block/i-block';

const
	radius = 50,
	diameter = radius * 2,
	circumference = diameter * Math.PI;

@component({flyweight: true, functional: true})
export default class bCircularProgress extends iBlock {
	/**
	 * The value of the progress
	 */
	@prop({type: Number, required: true})
	readonly value!: number;

	/**
	 * The lower limit of progress
	 */
	@prop({type: Number})
	readonly min: number = 0;

	/**
	 * The upper limit of progress
	 */
	@prop({type: Number})
	readonly max: number = 100;

	/**
	 * Bar color
	 */
	@prop({type: String, required: false})
	readonly color?: string;

	/**
	 * Bar loop color
	 */
	@prop({type: String, required: false})
	readonly trackColor?: string;

	/**
	 * Bar line thickness
	 */
	@prop({type: Number, validator: (v) => v >= 0 && v <= 1})
	readonly thickness: number = 0.15;

	/**
	 * Bar size
	 */
	@prop({type: String, required: false})
	readonly size?: string;

	/**
	 * Value font size
	 */
	@prop({type: String, required: false})
	readonly fontSize?: string;

	/**
	 * Show value
	 */
	@prop({type: Boolean})
	readonly showValue: boolean = false;

	/**
	 * Radius for transfer to svg
	 */
	@system()
	radius: number = radius;

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		...iVisible.mods
	};

	/**
	 * ViewBox dimensions
	 */
	get viewBox(): number {
		return diameter / (1 - this.thickness / 2);
	}

	/**
	 * ViewBox coordinates
	 */
	get viewBoxAttr(): string {
		return `${this.viewBox / 2} ${this.viewBox / 2} ${this.viewBox} ${this.viewBox}`;
	}

	/**
	 * Fullness of progress
	 */
	get strokeDashOffset(): number {
		const progress = 1 - (this.value - this.min) / (this.max - this.min);
		return progress * circumference;
	}

	/**
	 * Stroke width for drawing
	 */
	get strokeWidth(): number {
		return this.thickness / 2 * this.viewBox;
	}
}
