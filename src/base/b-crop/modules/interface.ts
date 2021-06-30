/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface Size {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface MoveStartEvent {
	offsetX: number;
	offsetY: number;
	width: number;
	height: number;
}

export interface SelectStartEvent {
	pageX: number;
	pageY: number;
}

export interface MinMax {
	minWidth: number;
	maxWidth: number;
	minHeight: number;
	maxHeight: number;
}

export type SizeOff = number | boolean;
export type StrSize = number | string;
export type Ratio = [number, number] | boolean;
