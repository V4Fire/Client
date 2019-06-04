/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { SizeOff, Ratio } from 'base/b-crop/b-crop';
export * from 'base/b-crop/modules/interface';

export interface Tools {
	crop?: {
		minWidth?: SizeOff;
		minHeight?: SizeOff;
		clickWidth?: number;
		clickHeight?: number;
		ratio?: Ratio;
		ratably?: boolean;
		freeSelect?: boolean;
		selectByClick?: boolean;
		resizeSelect?: boolean;
		moveSelect?: boolean;
	};

	rotate?: {
		left?: boolean;
		right?: boolean;
	};
}

export interface NormalizedTools extends Tools {
	rotate: {
		left: boolean;
		right: boolean;
	};
}

export type RotateSide =
	'left' |
	'right';
