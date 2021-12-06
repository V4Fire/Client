/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { alignTypes, sliderModes } from 'base/b-slider/const';

export interface SlideRect extends DOMRect {
	offsetLeft: number;
}

/**
 * -1 - Previous
 *  0 - Not changed
 *  1 - Next
 */
export type SlideDirection = -1 | 0 | 1;

export type AlignType = keyof typeof alignTypes;
export type Mode = keyof typeof sliderModes;
