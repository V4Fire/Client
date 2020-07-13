/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export type ScrollSide = 'x' | 'y';
export type FixSizeTypes = 'width' | 'height';
export type OverflowTypes = 'auto' | 'hidden' | 'scroll' | 'visible' | 'inherit';

export interface ScrollSize {
	width?: number;
	height?: number;
}

export interface Offset {
	top: number;
	left: number;
}

export interface ScrollerPosition {
	x?: number;
	y?: number;
}

export interface InputScrollerPosition {
	x?: number | 'left' | 'right';
	y?: number | 'top' | 'bottom';
}
